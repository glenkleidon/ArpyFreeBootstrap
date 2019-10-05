interface FormAction {
    form: HTMLFormElement;
    url: string;
    action: any;
    target: any;
    method: string;
    sender: HTMLElement;
}

function dispatch(sender: Event) {
    var element : HTMLElement = sender.srcElement as HTMLElement;
    formDispatcher.execute(element);
}


class FormDispatcher {
    private actionList: Array<FormAction> = [];
    private hasJQuery : boolean;
    constructor () {
        // @ts-ignore
        this.hasJQuery = !(typeof $ === 'undefined');
    }

    findSender(sender: HTMLElement): number {
        return this.actionList.findIndex(c => c.sender === sender);
    }

    execute(sender: HTMLElement): void {
        let actionIndex = this.findSender(sender);
        if (actionIndex >= 0) {
            this.dispatch(this.actionList[actionIndex]);
        }
    }

    addFetch(formAction: FormAction) {
        let exists = this.findSender(formAction.sender)
        if (exists >= 0) {
            this.actionList[exists] = formAction;
        } else {
            this.actionList.push(formAction);
        }
    }

    transformToURLEncoded(form:HTMLFormElement) :string {
        let str = [];
        let fmInput = form.querySelectorAll("input,textarea");
        for(var p in fmInput) {
            let fmElement = fmInput[p] as HTMLInputElement;
            let elementValue = fmElement.value;
            if (elementValue) {
              let elementName = (fmElement.name || fmElement.id);
              if (elementName) str.push(`${encodeURIComponent(elementName)}=${encodeURIComponent(fmElement.value)}`);
            }
        }
        return str.join("&");       
    }

    private status(response: any) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    private decode(response: any) {
    //    return response.json();
    //    return response.formdata();
        return response.text();
    //    return response.json();
    }

    dispatch(formAction: FormAction) {
        // is there jquery/bootstrap validation?
        // @ts-ignore
        if (!(typeof $ === 'undefined')) {
        // @ts-ignore
          // if($.validate) { $.validate() };
        }

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

    displayResponse(response: any, target: any) {
        // target is mostly a dummy.
        alert(response);
    }

    populate(form: HTMLFormElement , content :any) {
        /// later
    }


}

class SiteControl {
    private _pageName: string;

    constructor(public siteName: string, public dispatcher: FormDispatcher) { }

    set pageName(pageName: string) {
        this._pageName = pageName;
        let pageNameObj = this.prop('page_name');
        if (pageNameObj) {
            pageNameObj.innerText = pageName;
        }
    }

    get pageName() {
        return this._pageName;
    }

    private doOnSubmit = (form: any, url: string, action: string, controller: any, target: any) => {
        var cb;
    }

    prop(objName: string): any {
        var obj = document.getElementById(objName);
        if (!obj) {
            let empty = {};
            return empty;
        }
        return obj;
    }

    onSubmit(form: any, url: string, action: string, target: any) {
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
            };

            // need to change the submit to a button and a click event.
            let submitButton = fm.querySelector("input[type='submit'],button[type='submit']");
            if (!!(submitButton)) {
                submitButton.type = 'button';
                submitButton.onclick = dispatch;
            }

            // create the handler for the fetch.
            let fa: FormAction = {
                form: fm,
                method: 'post',
                url: url,
                action: cb,
                target: target,
                sender: submitButton
            };

            this.dispatcher.addFetch(fa)
        }
    }

}

if (typeof formDispatcher === 'undefined') {
    var formDispatcher = new FormDispatcher();
}

if (typeof siteControl === 'undefined') {
    var siteControl = new SiteControl("Arpy", formDispatcher);
}

