function UserPlacard_transforms() {
	// Turn `<Avatar>` into `<a class="Avatar"><img/></a>`
	createEl_Before.push(function(orig, config) {
		if (orig.tag === 'Avatar') {
			config.tag = 'div'
			delete config.attrs.img
			pushPropStr(config.attrs, 'class', 'Avatar')
		}
	});
	createEl_After.push(function(orig, config, a) {
		if (orig.tag === 'Avatar') {
			pushEl(a, createEl('img', {src:orig.attrs.img}))
		}
	});

	// Turn `<UsernameLink>` into `<a class="UsernameLink">`
	createEl_Before.push(function(orig, config) {
		if (orig.tag === 'UsernameLink') {
			config.tag = 'a'
			pushPropStr(config.attrs, 'class', 'UsernameLink')
		}
	});

	// `[seniority]` is a custom attr, replace it with a class 
	createEl_Before.push(function(orig, config) {
		if (orig.tag === 'Badge') {
			pushPropStr(config.attrs, 'class', 'seniority_' + config.attrs.seniority)
			delete config.attrs.seniority
		}
	});

	// `<Badge>` needs a `<ProgressMeter>`
	createEl_After.push(function(orig, config, el) {
		if (orig.tag === 'Badge') {
			pushEl(el, createEl('ProgressMeter'))
		}
	});

	// Use friendlier wording for `<MemberSince>`
	createEl_After.push(function(orig, config, el) {
		if (orig.tag === 'MemberSince') {
			pushEl(el, createEl('span', {}, 'Member since %time'))
		}
	});
}
UserPlacard_transforms();

function UserPlacardTpl() {
	var root = createEl('Box', {'class':'UserPlacard'})

	// Make 2 columns
	var columns = createSubEls(root,'Box',2)
	addClass(root, 'Total-Columns-2')
	addClass(columns[0], 'Column Column-1')
	addClass(columns[1], 'Column Column-2')

	// In `Column-1`, put the `<Avatar>` image
	pushEl(columns[0], createEl('Avatar', {img:'%avatar_img'}))

	// In `Column-2`, put `<UsernameLink>`, `<Badge>`, etc..
	pushEl(columns[1], createEl('UsernameLink', {href:'%profile_url'}, '%username'))
	pushEl(columns[1], createEl('Badge', {seniority:'%seniority'}))
	pushEl(columns[1], createEl('MemberSince', {time:'%time'}))

	// Let `<MenuButton>` toggle `<UserMenu>` <br/>Position: `anchorTopRight()`
	var menuButton = createEl('MenuButton', {}, '')
	anchorTopRight(columns[1], menuButton)
	clickToToggle(menuButton, UserMenuTpl())

	return root
}
