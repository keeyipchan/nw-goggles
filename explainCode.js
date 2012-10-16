function replaceComments(str) {
	var r = /^(\s*)\/\/\s*(.*?)\s*$/m
	var newStr = ""
	for(;;) {
		var m = str.match(r)
		if (!m)
			break;
		var snip = createEl('comment')
		snip.innerHTML = replaceSnippets(m[2])
		newStr += str.substring(0,m.index) + m[1] + snip.outerHTML
		str = str.substring(m.index + m[0].length)
	}
	return newStr + str;
}
function replaceSnippets(str) {
	var r = /`(.+?)`/
	var newStr = ""
	for(;;) {
		var m = str.match(r)
		if (!m)
			break;
		var snip = createEl('snippet')
		snip.innerText = m[1]
		newStr += str.substring(0,m.index) + snip.outerHTML
		str = str.substring(m.index + m[0].length)
	}
	return newStr + str;
}
function extractSig(f) {
	var str = f.toString()
	var m = str.match(new RegExp('function\\s+' + f.name + '\\s*\\(\(\.*?\)\\)'))
	return {
		str: str.replace(m[0], ''),
		sig: m[1]
	}
}

function explainCode(parentNode, str) {
	pushEl(parentNode, createEl('pre', {'class':'ExplainCode'},
		replaceComments(str).replace(/\t/g, '    ')
			.replace(/(Apply)\((.*Tpl)/g, '<highlight>$1</highlight>(<highlight>$2</highlight>')
			.replace(/(START)(\(\);)/mg, '<highlight>$1</highlight>$2')
			.replace(/(input.focus)(\(\);)/mg, '<highlight>$1</highlight>$2')
			.replace(/(while|continue|break|return|function|var)(\s*)/mg, '<keyword>$1</keyword>$2')
			.replace(/(ON_START|createEl_Before|createEl_After|forceModal|setAttribute|findSiblingWithAttr|delegate|pushEl|createEl)(\.|\(|\[)/mg, '<highlight>$1</highlight>$2')
			.replace(/(\S+\.(?:js|css))/g, '<file>$1</file>')
			.replace(/'(.*\.(?:png|jpg))'/g, '<img src="$1"/>')
	))
	return parentNode
}

function explainFunction(parentNode, f) {
	var ff = extractSig(f)
	pushEl(parentNode, createEl('h4', {}, 'function <b>' + f.name + '</b>('+ff.sig+')'))
	explainCode(parentNode, ff.str)
	return parentNode
}
