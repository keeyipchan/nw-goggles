DOCUMENT = window.document
EVERYTHING = document.querySelector('#EVERYTHING')

function selection_object(parent, elements) {
	this.elements = elements
	if (parent) {
		this.parent = parent
		this.onNewData = parent.onNewData
		this.decorators = parent.decorators
		this.data = parent.data
	} else {
		this.parent = null
		this.onNewData = null
		this.decorators = []
		this.data = []
	}
}

function _all(selobj, sel) {
	var els2 = []

	each(selobj.elements, function() {
		els2 = els2.concat(Array.prototype.slice.call(this.querySelectorAll(sel), 0))
	})

	return new selection_object(selobj, els2)
}

function _get(selobj, sel) {
	var els2 = []

	each(selobj.elements, function() {
		els2.push(this.querySelector(sel))
	})

	return new selection_object(selobj, els2)
}

function Inside() {
	return function() {
		// this instanceof selection_object
		return new selection_object(this, [])
	}
}
function _append(selobj, gen) {
	var els2 = []
	var els = selobj.elements
	var parent = selobj.parent
	if (parent) {
		each(parent.elements, function() {
			var el = gen()
			this.appendChild(el)
			els.push(el)
			els2.push(el)
		})
	}
	return els2
}
function pushEl(parent, child) {
	parent.appendChild(child)
}

function start(method, items) {
	return method.call(this, items)
}

function Data(sz, data) {
	return function() {
		// this instanceof selection_object
		var seldata = this.data
		_from_1(0, data.length, sz, function(a,b) {
			seldata.push(data.slice(a,b))
		})
	}
}

function SEQ(items) {
	var res
	var self = this
	each(items, function() {
		if (typeof this == 'function') {
			res = this.call(self)
		} else {
			res = self = this
		}
	})
	return res
}
function CHAIN(items) {
	var self = this
	each(items, function() {
		if (typeof this == 'function') {
			var obj = this.call(self)
			if (typeof obj != 'undefined') {
				self = obj
			}
		} else {
			self = this
		}
	})
	return self
}

function Get(sel) {
	return function() {
		if (this instanceof selection_object) {
			return _get(this, sel)
		} else if (this instanceof HTMLDocument || this instanceof HTMLElement) {
			return new selection_object(null, [this.querySelector(sel)])
		}
	}
}

function All(sel) {
	return function() {
		if (this instanceof selection_object) {
			return _all(this, sel)
		} else if (this instanceof HTMLDocument || this instanceof HTMLElement) {
			return new selection_object(null, this.querySelectorAll(sel))
		}
	}
}

function Append(simpl) {
	return function() {
		// this instanceof selection_object
		return _append(this, function() {
			return document.createElement(simpl)
		})
	}
}
function OnNewData(method, items) {
	return function() {
		// this instanceof selection_object
		var self = this
		items.unshift(self)
		self.onNewData = function() {
			var res = start.call(self, method, items)
			return new selection_object(self, res)
		}
	}
}

function SetHTML(tpl) {
	return function() {
		// this instanceof selection_object
		this.decorators.push(function(el, data, eli) {
			var s = tpl
			var n = data.length
			for (var i=0; i < n; i++) {
				var ii = i+1
				s = s.replace(new RegExp("%"+ii,"g"), data[i])
			}
			el.innerHTML = s
		})
	}
}
function SetText(tpl) {
	return function() {
		// this instanceof selection_object
		this.decorators.push(function(el, data, eli) {
			var s = tpl
			var n = data.length
			for (var i=0; i < n; i++) {
				var ii = i+1
				s = s.replace(new RegExp("%"+ii,"g"), data[i])
			}
			el.innerText = s
		})
	}
}

function Render() {
	return function() {
		// this instanceof selection_object
		var data = this.data, n_data = data.length
		if (n_data == 0)
			return

		var els = this.elements, n_els = els.length
		var decs = this.decorators

		each(decs, function() {
			var dec = this
			each(els, function(i) {
				dec(this, data[i], i)
			})
		})

		var onNewData = this.onNewData
		if (n_els == n_data || !onNewData)
			return

		each(decs, function() {
			var dec = this
			_from_1 (n_els, n_data, 1, function(i) {
				var data_i = data[i]
				each (onNewData().elements, function(q) {
					dec(this, data_i, q)
				})
			})
		})
	}
}

//@is util
function _from_1 (start,end, sz, f) {
	var i=start
	for (; i < end; i += sz) {
		f(i, i + sz)
	}
}

//@is async
function Wait(delay, method, items) {
	return function() {
		var self = this
		setTimeout(function() {
			start.call(self, method, items)
		}, delay*1000);
	}
}

//@is util
function each(list, f) {
	var i = 0, n = list.length
	for (; i < n; i++) {
		f.call(list[i], i)
	}
}

//@is util
function eachProp(obj, f) {
	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			f.call(obj[k], k)
		}
	}
}

//@is util
function _wait(duration, f) {
	setTimeout(f,duration)
}

//@is async
//@this[1] instanceof selection_object
function Animate(duration, props) {
	var trans = []
	eachProp(props, function(k) {
		trans.push(k)
	})
	var tr = trans.join(' ') + ' ' + duration + 's';

	return function (done) {
		//@this[1]

		var els = this.elements

		each(els, function(i) {
			var style = this.style, val = style.webkitTransition
			if (val) {
				style.webkitTransition = val + ', ' + tr
			} else {
				style.webkitTransition = tr
			}
		})

		_wait(0, function() {
			each(els, function(i) {
				var el = this
				eachProp(props, function(k) {
					el.style[k] = this
				})
			})

			done && _wait(duration * 1000, done)
		})
	}
}

function Alert(s) {
	return function(done) {
		done && done()
	}
}
function Defer(method, items) {
	var self;

	function next() {
		var f = items.shift()
		f && f.call(self, next)
	}

	return function() {
		self = this
		next()
	}
}

function shallowCopy(attrs) {
	var c = {}
	for (var k in attrs) {
		if (attrs.hasOwnProperty(k))
			c[k] = attrs[k]
	}
	return c
}
createEl_Before = []
createEl_After = []
function createEl(tag, attrs, content) {
	if (!attrs)
		attrs = {}

	var origAttrs = shallowCopy(attrs)

	var orig = {
		tag: tag,
		attrs: origAttrs,
		content: content
	}
	var config = {
		tag: tag,
		attrs: attrs,
		content: content
	}
	each(createEl_Before, function() {
		this(orig, config)
	})

	var el = document.createElement(config.tag)
	for (var k in config.attrs) {
		if (config.attrs.hasOwnProperty(k))
			el.setAttribute(k, config.attrs[k])
	}
	el.innerHTML = config.content || ''

	each(createEl_After, function() {
		this(orig, config, el)
	})

	return el
}


// pushPropStr({'class':'draggable'}, 'class', 'droppable') => {'class':'draggable droppable'}
// pushPropStr({}, 'class', 'droppable') => {'class':'droppable'}
function pushPropStr(obj, k, v) {
	if (obj[k])
		obj[k] += ' ' + v
	else
		obj[k] = v
}

// pushAttr({'class':'draggable'}, 'class', 'droppable') => {'class':'draggable droppable'}
// pushAttr({}, 'class', 'droppable') => {'class':'droppable'}
function pushAttr(el, k, v) {
	var val = el.getAttribute(k)
	if (val)
		el.setAttribute(k, val + ' ' + v)
	else
		el.setAttribute(k, v)
}

function addClass(el, v) {
	each(v.split(/\s+/g), function() {
		el.classList.add(this)
	})
	return el
}
function swapClass(el, a, b) {
	if (el.classList.contains(a)) {
		el.classList.remove(a)
		el.classList.add(b)
		return b
	} else {
		el.classList.remove(b)
		el.classList.add(a)
		return a
	}
}

function createSubEls(parent, tag, n) {
	 var b = []
	 for (var i=0; i < n; i++) {
		 var el = createEl(tag)
		 pushEl(parent, el)
		 b.push(el)
	 }
	 return b;
}

function Apply(tpl, params) {
	var tmp = createEl('div')
	pushEl(tmp, tpl())

	var html = tmp.innerHTML
	eachProp(params, function(k) {
		html = html.replace(new RegExp(k, 'g'), this)
	})
	tmp.innerHTML = html

	return tmp.children[0]
}

function toSimpl(el) {
	// <highlight>Example:</highlight> <br/>Given `<a id="email" class="home no-spam">` <br/>Generate `a#email.home.no-spam` <br/>Exclude classes that change: `.Hidden`, `.Visible`

	var id = el.id ? '#' + el.id : '';
	return el.tagName + id + '.' + el.classList.toString().replace(/ /g, '.').replace(/\.?(Hidden|Visible)(\.?)/g, '')
}

function matchSimpl(el, simpl) {
	return toSimpl(el) === simpl
}

function delegate(container, eventName, simpl, callback) {
	container.addEventListener(eventName, function(event) {
		for (var p = event.target; p && p != document; p = p.parentNode) {
			if (matchSimpl(p, simpl)) {
				return callback.call(p, event)
			}
		}
	}, true)
}

function debounce(ms, callback) {
	var timer = null
	return function() {
		clearTimeout(timer)
		timer = setTimeout(callback, ms)
	}
}

function getXY(el, relativeTo) {
	var pos = {x:0, y:0}
	for (var p = el; p && p != relativeTo; p = p.offsetParent) {
		pos.x += p.offsetLeft
		pos.y += p.offsetTop
	}
	return pos
}
function forceModal(el, callback, noClone) {
	var modal = createEl('Modal')
	modal.style.position = 'absolute'
	modal.style.top = '0'
	modal.style.left= '0'
	modal.style.right = '0'
	modal.style.bottom= '0'
	modal.style.background='hsla(0,0%,0%,0.2)'

	modal.onclick = function(event) {
		if (event.target === modal) {
			EVERYTHING.removeChild(modal)
			callback()
		}
	}

	if (noClone) {
		pushEl(modal, el)
		pushEl(EVERYTHING, modal)
	} else {
		var clone = el.cloneNode(true)
		pushEl(modal, clone)
		pushEl(EVERYTHING, modal)


		function updatePos() {
			var p = getXY(el, EVERYTHING)
			modal.removeChild(clone)
			clone.style.position = 'absolute'
			clone.style.top = p.y + 'px'
			clone.style.left= p.x + 'px'
			clone.style.width = 'auto'
			clone.style.height = 'auto'
			modal.appendChild(clone)
		}

		updatePos()
		window.addEventListener('resize', debounce(100, updatePos), true)
	}

}

function onPressEnter(textarea, callback) {
	textarea.onkeyup = function(event) {
		if (event.which == 13)
			return callback(event)
	}
}

function findSiblingWithAttr(el, attr, val) {
	return el.parentNode.querySelector('[' + attr + '="' + val + '"]')
}

ON_START = {}
function START() {
	eachProp(ON_START, function() {
		this();
	})
}
