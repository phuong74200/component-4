var css = `
    .SetPageTerm-definitionText { color: transparent; }
    .SetPageTerm-definitionText:hover { color: white; }
`,
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

head.appendChild(style);

style.type = 'text/css';
if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

function elementInViewport(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }

    return (
        top >= window.pageYOffset &&
        left >= window.pageXOffset &&
        (top + height) <= (window.pageYOffset + window.innerHeight) &&
        (left + width) <= (window.pageXOffset + window.innerWidth)
    );
}

let max = document.querySelector("#setPageSetIntroWrapper > div > div > div.SetPage-studyPreview > section > div > div > div > div.CardsList-navControl.progressIndex > span").textContent.split("/")[1];

document.onscroll = function() {
    let viewed = 0;
    for(let e of document.getElementsByClassName("SetPageTerm has-definitionText is-showing")) {
        if(!elementInViewport(e)) {
            viewed++;
        } else {
            document.querySelector("#SetPageTarget > div > div.SetPage-setContentWrapper > div.SetPageStickyHeader.is-pinned.hgmlhdt > div > h3").textContent = `${viewed}/${max}`;
            break;
        }
    }
}