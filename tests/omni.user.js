// ==UserScript==
// @name         BBB-debug
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://kbin.social/*
// @require      https://github.com/aclist/kbin-kes/raw/testing/helpers/safegm.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kbin.social
// @grant	GM_addStyle
// @grant	GM_xmlhttpRequest
// ==/UserScript==

//TODO: if mod is on, cache subs and set listener
//TODO: GM. API xhr request

const modCss = `
.kes-subs-modal {
    position: fixed;
    z-index: 100;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.5);
}
`
const listCss = `
@media (max-width: 576px) {
    #myUL {
        width: fit-content !important
    }
}
#innerBox {
    height: 80%;
    overflow-y: scroll;
}
#myUL {
    height: 80%;
    list-style-type: none;
    padding: 50px;
    margin: 0;
    width: fit-content;
}
#myUL li{
    border-bottom: 1px solid var(--kbin-vote-text-color);
    border-top: 1px solid var(--kbin-vote-text-color);
    margin-top: -1px; /* Prevent double borders */
    background-color: var(--kbin-section-bg);
    color: var(--kbin-button-secondary-text-hover-color);
    padding: 5px;
    text-decoration: none;
    font-size: 18px;
    border: 1px solid gray;
    display: block;
}
.kes-subs-active {
    background-color: var(--kbin-primary-color) !important;
}
#myS:focus {
    outline: none
}
#myS {
    width: 100%;
    margin-bottom: 1px;
    background-color: var(--kbin-vote-text-color);
    color: var(--kbin-bg);
    padding: 5px;
}
`
GM_addStyle(listCss)
GM_addStyle(modCss)
const user = document.querySelector('.login');
const username = user.href.split('/')[4];

document.addEventListener('keydown', (e) =>{
        e.preventDefault();
    if (e.keyCode === 9) {
        const exists = document.querySelector('.kes-subs-modal')
        console.log(exists)
        if (exists) {
            exists.remove();
            return
        } else {
           prepare();
        }
    }

});
function prepare () {
    genericXMLRequest(`https://kbin.social/u/${username}/subscriptions`, build)
}
function build (response) {
    let parser = new DOMParser();
    let notificationsXML = parser.parseFromString(response.responseText, "text/html");
    const col = notificationsXML.querySelector('.magazines-columns')
    const links = col.querySelectorAll('.stretched-link')
    const clean = []
    links.forEach((link) => {
        clean.push(link.innerText)
        clean.sort().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    });
    omni(clean);
}
function omni (subs) {
    const d = document.createElement('div')
    d.className = "kes-subs-modal"
    d.addEventListener('click', (e) =>{
        if ((e.target.tagName === "UL") || (e.target.tagName === "DIV")) {
            const torem = document.querySelector('.kes-subs-modal')
            torem.remove();
        }
    });
    const entryholder = document.createElement('ul')
    const search = document.createElement('input')
    search.type = "search"
    search.id = "myS"
    search.setAttribute
    let pos = 0
    search.addEventListener("keydown", (e) => {
        switch (e.keyCode) {
     //   case 9: {
     //       e.preventDefault();
     //       d.remove();
     //       break;
     //   }
        case 40: {
            const um = document.querySelector('#myUL')
            const m = Array.from(um.querySelectorAll('li'))
            const vis = []
            for (j = 0 ; j < m.length; ++j) {
                if (m[j].style.display !== 'none') {
                    vis.push(m[j])
                }
            }
            vis[pos].classList.remove("kes-subs-active")
            pos = ++pos
            if (pos >= vis.length) {
                pos = 0
            }
            vis[pos].classList.add("kes-subs-active")
            break;
        }
        case 38: {
            e.preventDefault();
            const um = document.querySelector('#myUL')
            const m = Array.from(um.querySelectorAll('li'))
            const vis = []
            for (j = 0 ; j < m.length; ++j) {
                if (m[j].style.display !== 'none') {
                    vis.push(m[j])
                }
            }
            vis[pos].classList.remove("kes-subs-active")
            pos = --pos
            if (pos < 0) {
                pos = (vis.length - 1)
            }
            vis[pos].classList.add("kes-subs-active")
            break;
        }
        }
    });
    search.addEventListener("keyup", (e) => {
        switch (e.keyCode) {
        case 13: {
            const act = document.querySelector("#myUL li.kes-subs-active")
            const dest = act.textContent
            window.location = 'https://kbin.social/m/' + dest
            break;
        }
        case 38: {
            e.preventDefault();
            break;
        }
        case 40: {
            break;
        }
        default: {
            const filter = e.target.value

            const visi = []
            const LL = e.target.parentElement
            const VB = LL.querySelectorAll('li')
            for (let i = 0; i < VB.length; i++) {
                let t = VB[i].textContent
                if (t.toLowerCase().indexOf(filter) > -1) {
                    visi.push(VB[i])
                    VB[i].style.display = "";
                } else {
                    VB[i].style.display= "none";
                    VB[i].classList.remove('kes-subs-active')
                }
            }
            for (let k = 0; k< visi.length; ++k) {
                if (k === 0) {
                    visi[k].classList.add('kes-subs-active')
                } else {
                    visi[k].classList.remove('kes-subs-active')
                }
            }
            pos = 0
        }
        }
    });

    entryholder.id = 'myUL'
    const innerholder = document.createElement('div')
    innerholder.id = 'innerBox'
    innerholder.appendChild(search);
    for (let i = 0; i <subs.length; ++i) {
        let outerA = document.createElement('a')
        let entry = document.createElement('li');
        if (i === 0) {
            entry.className = 'kes-subs-active'
        }
        entry.innerText = subs[i];
        outerA.appendChild(entry)
        outerA.href = 'https://kbin.social/m/' + subs[i]
        innerholder.appendChild(outerA);
    }
    entryholder.appendChild(innerholder)
    d.appendChild(entryholder)
    innerholder.addEventListener('mouseover', (e) => {
        const o = e.target.parentNode.parentNode
        const old = o.querySelector('.kes-subs-active')
        if (e.target.tagName === "LI") {
            old.classList.remove("kes-subs-active")
            e.target.classList.add('kes-subs-active')
        }
    });
    document.body.appendChild(d)
    document.querySelector("#myS").focus();
}
