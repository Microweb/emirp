var $ = function (selector) {
    selector = selector.replace(/\s+/g,' ').replace(/^\s+|\s+$/,'');
    if(!selector){
        throw Error('Expected selector');
    }
    if(typeof selector !== 'string'){
        throw TypeError('Expected string');
    }

    //quick check
    var match = /^(?:([#\.])?([\w-]+))$/.exec(selector);
    if(match){
        var type = match[1];
        if(type === '#'){
            var element = document.getElementById(match[2]);
            return element ? [element] : [];
        }else if(type === '.'){ // by CLASS
            return byClass(match[2]);
        }else{ //by TAG
            return toArray(document.getElementsByTagName(match[2]));
        }
    }

    //something more complicated
    var filters = {
        id:function(item, id){
            return item.id === id;
        },
        class:function(item, klass){
            if(item.classList){
                return item.classList.contains(klass);
            }
            return item.className.split(' ').indexOf(klass) !== -1;
        },
        tag:function(item, tag){
            return item.tagName.toLowerCase() === tag;
        }
    };

    var finders = {
        id:function(value){
            var element = document.getElementById(value);
            return element ? [element] : [];
        },
        tag:function(value){
            return toArray(document.getElementsByTagName(value));
        },
        class:function(value){
            return byClass(value);
        }
    };

    var query = {
        id:'',
        tag:'',
        class:''
    };

    parse(query, selector);

    var elements = [];

    for(var name in finders){
        if(query[name]){
            var finder = finders[name];
            elements = finder(query[name]);
            delete query[name]; // future filters without finding rule
            break;
        }
    }

    elements = elements.filter(filterItem);

    function filterItem(item){
        for(var name in filters){
            if(query[name]){
                var filter = filters[name];
                if(!filter(item, query[name])){
                    return false;
                }
            }
        }
        return true;
    }

    function parse(query, selector){
        var pattern = /^([#\.])?([\w-]+)/;

        search();
        search();
        search();

        function search(){
            if(selector){
                match = pattern.exec(selector);
                if(match){
                    var value = match[2];
                    var sign = match[1];
                    query[type(sign)] = value;
                    selector = selector.slice(value.length + (sign ? 1 : 0));
                }
            }
        }

        function type(sign){
            switch (sign) {
                case '#': return 'id';
                case '.': return 'class';
                default: return 'tag';
            }
        }
    }

    function toArray(items){
        return Array.prototype.slice.call(items);
    }

    function byClass(selector){
        if(document.getElementsByClassName){
            return document.getElementsByClassName(selector);
        }
        var elements = toArray(document.getElementsByTagName('*'));
        return elements.filter(function(item){
            return filters.class(item, selector);
        });
    }

    return elements;
};
