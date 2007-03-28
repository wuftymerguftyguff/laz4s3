 
    /**
        Turn a simple structure of nested XML elements into a 
        JavaScript object.

        TODO: Handle attributes?
    */
    xmlToObj: function(parent, force_lists, path) {
        var obj = {};
        var cdata = '';
        var is_struct = false;

        for(var i=0,node; node=parent.childNodes[i]; i++) {
            if (3 == node.nodeType) { 
                cdata += node.nodeValue;
            } else {
                is_struct = true;
                var name  = node.nodeName;
                var cpath = (path) ? path+'.'+name : name;
                var val   = arguments.callee(node, force_lists, cpath);

                if (!obj[name]) {
                    var do_force_list = false;
                    if (force_lists) {
                        for (var j=0,item; item=force_lists[j]; j++) {
                            if (item == cpath) {
                                do_force_list=true; break;
                            }
                        }
                    }
                    obj[name] = (do_force_list) ? [ val ] : val;
                } else if (obj[name].length) {
                    // This is a list of values to append this one to the end.
                    obj[name].push(val);
                } else {
                    // Has been a single value up till now, so convert to list.
                    obj[name] = [ obj[name], val ];
                }
            }
        }

        // If any subnodes were found, return a struct - else return cdata.
        return (is_struct) ? obj : cdata;
    },




    /**
        Abstract HMAC SHA1 signature calculation.
    */
    hmacSHA1: function(data, secret) {
        // TODO: Alternate Dojo implementation?
        return b64_hmac_sha1(secret, data)+'=';
    },
    
    /**
        Return a date formatted appropriately for HTTP Date header.
        Inspired by: http://www.svendtofte.com/code/date_format/

        TODO: Should some/all of this go into common.js?
    */
    httpDate: function(d) {
        // Use now as default date/time.
        if (!d) d = new Date();

        // Date abbreviations.
        var daysShort   = ["Sun", "Mon", "Tue", "Wed",
                           "Thu", "Fri", "Sat"];
        var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // See: http://www.quirksmode.org/js/introdate.html#sol
        function takeYear(theDate) {
            var x = theDate.getYear();
            var y = x % 100;
            y += (y < 38) ? 2000 : 1900;
            return y;
        };

        // Number padding function
        function zeropad(num, sz) { 
            return ( (sz - (""+num).length) > 0 ) ? 
                arguments.callee("0"+num, sz) : num; 
        };
        
        function gmtTZ(d) {
            // Difference to Greenwich time (GMT) in hours
            var os = Math.abs(d.getTimezoneOffset());
            var h = ""+Math.floor(os/60);
            var m = ""+(os%60);
            h.length == 1? h = "0"+h:1;
            m.length == 1? m = "0"+m:1;
            return d.getTimezoneOffset() < 0 ? "+"+h+m : "-"+h+m;
        };

        var s;
        s  = daysShort[d.getDay()] + ", ";
        s += d.getDate() + " ";
        s += monthsShort[d.getMonth()] + " ";
        s += takeYear(d) + " ";
        s += zeropad(d.getHours(), 2) + ":";
        s += zeropad(d.getMinutes(), 2) + ":";
        s += zeropad(d.getSeconds(), 2) + " ";
        s += gmtTZ(d);

        return s;
    },

  

};

if (!window['queryString']) {
    // Swiped from MochiKit
    function queryString(params) {
        var l = [];
        for (k in params) 
            l.push(k+'='+encodeURIComponent(params[k]))
        return l.join("&");
    }
}

if (!window['getXMLHttpRequest']) {
    // Shamelessly swiped from MochiKit/Async.js
    function getXMLHttpRequest() {
        var self = arguments.callee;
        if (!self.XMLHttpRequest) {
            var tryThese = [
                function () { return new XMLHttpRequest(); },
                function () { return new ActiveXObject('Msxml2.XMLHTTP'); },
                function () { return new ActiveXObject('Microsoft.XMLHTTP'); },
                function () { return new ActiveXObject('Msxml2.XMLHTTP.4.0'); },
                function () { return null; }
            ];
            for (var i = 0; i < tryThese.length; i++) {
                var func = tryThese[i];
                try {
                    self.XMLHttpRequest = func;
                    return func();
                } catch (e) {
                    // pass
                }
            }
        }
        return self.XMLHttpRequest();
    }
}

