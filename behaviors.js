function clickToToggle(button, el, notModal) {
	// <highlight>Purpose:</highlight> `click` <b>any element</b> that matches `toSimpl(button)`, toggle <b>sibling element</b> that matches `toSimpl(el)`; shown in a <b>modal</b>
	;

	pushEl(button.parentNode, el)
	addClass(el, 'Hidden')

	// Use `el[lookup]` to connect with `button`
	var lookup = toSimpl(button) + '--clickToToggle--' + toSimpl(el)
	el.setAttribute('lookup', lookup)

	
	// Register with `ON_START`, `delegate` clicks
	if (!ON_START[lookup]) {
		ON_START[lookup] = function() {
			delegate(document.body, 'click', toSimpl(button), function(event) {
				var targetEl = findSiblingWithAttr(this, 'lookup', lookup)

				function swap() {
					return swapClass(targetEl, 'Hidden', 'Visible')
				}

				var after = swap()

				if (notModal) {
					return
				} else if (after == 'Visible') {
					// See <note>1</note>, make sure clone is visible after the 1st toggle
					targetEl.style.visibility = 'visible'

					// Put `targetEl` in a modal <br/>When modal closes, `swap()`
					forceModal(targetEl, swap)

					// <note>1</note> Modal creates a clone so hide the original.
					targetEl.style.visibility = 'hidden'
				}
			})
		}
	}
}
