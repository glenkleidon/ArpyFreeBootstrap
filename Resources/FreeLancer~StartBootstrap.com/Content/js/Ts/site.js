function dispatch(sender) {
    var element = sender.srcElement;
    formDispatcher.execute(element);
}
class FormDispatcher {
    constructor() {
        this.actionList = [];
    }
    findSender(sender) {
        return this.actionList.findIndex(c => c.sender === sender);
    }
    execute(sender) {
        let actionIndex = this.findSender(sender);
        if (actionIndex >= 0) {
            this.dispatch(this.actionList[actionIndex]);
        }
    }
    addFetch(formAction) {
        let exists = this.findSender(formAction.sender);
        if (exists >= 0) {
            this.actionList[exists] = formAction;
        }
        else {
            this.actionList.push(formAction);
        }
    }
    transformToURLEncoded(form) {
        let str = [];
        let fmInput = form.querySelectorAll("input");
        for (var p in fmInput)
            str.push(encodeURIComponent(fmInput[p].name) + "=" + encodeURIComponent(fmInput[p].value));
        return str.join("&");
    }
    status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
        }
        else {
            return Promise.reject(new Error(response.statusText));
        }
    }
    decode(response) {
        return response.text();
    }
    dispatch(formAction) {
        fetch(formAction.url, {
            method: formAction.method,
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: this.transformToURLEncoded(formAction.form)
        })
            .then(this.decode)
            .then(formAction.action)
            .catch(function (error) {
            console.log('Request failed', error);
        });
    }
    displayResponse(response, target) {
        alert(response);
    }
    populate(form, content) {
    }
}
class SiteControl {
    constructor(siteName, dispatcher) {
        this.siteName = siteName;
        this.dispatcher = dispatcher;
        this.doOnSubmit = (form, url, action, controller, target) => {
            var cb;
        };
    }
    set pageName(pageName) {
        this._pageName = pageName;
        let pageNameObj = this.prop('page_name');
        if (pageNameObj) {
            pageNameObj.innerText = pageName;
        }
    }
    get pageName() {
        return this._pageName;
    }
    prop(objName) {
        var obj = document.getElementById(objName);
        if (!obj) {
            let empty = {};
            return empty;
        }
        return obj;
    }
    onSubmit(form, url, action, target) {
        if (!!form) {
            var fm;
            switch (typeof form) {
                case "string":
                    fm = this.prop(form);
                    break;
                case "object":
                    fm = form;
                    break;
                default:
                    return;
                    break;
            }
            let cb;
            switch (action) {
                case 'display':
                    cb = this.dispatcher.displayResponse;
                    break;
                case 'populate':
                    cb = this.dispatcher.populate;
                    break;
                default:
                    cb = target;
                    break;
            }
            ;
            let submitButton = fm.querySelector("input[type='submit']");
            if (!!(submitButton)) {
                submitButton.type = 'button';
                submitButton.onclick = dispatch;
            }
            let fa = {
                form: fm,
                method: 'post',
                url: url,
                action: cb,
                target: target,
                sender: submitButton
            };
            this.dispatcher.addFetch(fa);
        }
    }
}
if (typeof formDispatcher === 'undefined') {
    var formDispatcher = new FormDispatcher();
}
if (typeof siteControl === 'undefined') {
    var siteControl = new SiteControl("Arpy", formDispatcher);
}
