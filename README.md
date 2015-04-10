ActiveElement
============
`ActiveElement` provides convenience accessors to a DOM element.

`ActiveElement` does not modify DOM elements; instead it defines properties on a wrapper:

	// wrapper on #my-element
	var myObject = {
		el: document.getElementById('#my-element')
	};
	
	ActiveElement.defineDescriptor(myObject, 'visible', {
	    'type': 'class',
	});
	
	myObject.visible = true; // adds 'visible' class to myObject.el
	myObject.visible = false; // removes the class
	var isVisible = myObject.visible // cheks if el has the class

The purpose of `ActiveElement` is to gather all _View_ related stuff (class names, selectors, attributes) in one place (the _descriptor_) so that
they're not scattered around the code.

	// for one accessor
	ActiveElement.defineDescriptor(obj, key, descriptor);
	
	// for many of them
	ActiveElement.defineDescriptors(obj, {
		key1: descriptor1,
		key2: descriptor2,
		...
	});

target `el`
---------------
Which DOM element is the subject of accessor methods? You specify one with two properties in the descriptor: `el` and `selector`.

	<!-- html -->
	<div id="my-note">
	  <h3>Singing</h3>
	  <div class="summary"></div>
	  <div class="more-info"></div>
	  <address>
	    Somewhere over the rainbow...
	  </address>
	</div>

	// js
	var myNote = {
		el: document.getElementById('my-note'),
		address: document.querySelector('#my-note > address');
	};
	
	ActiveElement.defineDescriptors(myNote, {
		title: {
			selector: 'h3',
			type: 'property',
			name: 'textContent'
		},
		showMoreInfo: {
			selector: '.more-info',
			type: 'class',
			name: 'is-visible'
		},
		place: {
			el: 'address',
			type: 'property',
			prop: 'innerHTML'
		}
	});
	
	myNote.title; // "Singing"

	myNote.showMoreInfo = true; // .more-info gets 'is-visible' class

	myNote.place; // "Somewhere over the rainbow"
	myNote.place = "On the Stairway to Heaven";

### `el` property and _target_ element
The `el` property of the descriptor is used to point to a _root_ element. If:

- `el` is an `Element` - use the element

		var _root = _descriptor.el;

- `el` is string - use `myObject[el]`:

		var _root = _wrapper[descriptor.el];

If not specified, `el` equals "el", so if you put the node in `el` property of the wrapper you won't need to specify anything in the descriptor.
 
Now, if there's no `selector` property in the descriptor, the _target_ element is the _root_ element. Otherwise apply `querySelector` with `selector` value on the _root_ element:

	_target = descriptor.selector ?
		_root.querySelector(descriptor.selector) :
		_root;

The `_target` thus found is the `Element` to be accessed by declared properties (to change its CSS class, content etc.)

### descriptor type

The `type` property defines what exactly is being accessed

- `el`, `element` - the property value is the _target_ element itself
- `class` - defines a boolean property to un/set a CSS class
- `attr`, `attribute` - the property accesses _target_'s attribute (via `get/setAttribute`
- `prop`, `property` - the declared property maps directly to _target_'s property

### descriptor property

By specifying descriptor's `property` or `prop` or `name` property
we can e.g. declare which element's property is to be accessed, though the meaning of its value depends on the type. If the property is not specified, it defaults to the key that the descriptor is registered with:

	ActiveElement.defineDescriptor(myObject, 'innerHTML', {'type': 'property'});
	// the property to access is the key: 'innerHTML',
	// if we want to change they key, we need to
	// explicitly declare the property:
	ActiveElement.defineDescriptor(myObject, 'html', {'type': 'property', name: 'innerHTML'}
	// or "..., prop: 'innerHTML'" or "..., property: 'innerHTML'"

descriptors types
-----------------------

For each descriptor type I give info on how `property` is interpreted and what (types of) values the accessors handle.

### `el`, `element`, `node`

- `property` - ignored
- _value_ - `Element`

Any of these values for `type` property in the descriptor gets the _target_ element itself. It's a default type.

### `css`, `style`
- `property` - CSS property to use
- _value_ - string relevant to the CSS property

These values access _target_ element's `style` property:
 
	ActiveElement.defineDescriptor(myObject, 'offset', {
		type: 'style',
		property: 'left'
	});
	myObject.offset = "100px";
	// myObject.el.style.left = "100px";

### `class`
- `property` - class name to un/set
- _vlaue_ - true or false

Add or remove a class. If not specified, `el` equals "el", so if you put the node in `el` property of the wrapper you won't need to specify anything in the descriptor


### `mode`, `classmode`
- `property` - a list of mutually exclusive class names
- _value_ - class name (a member of the list)

Sets a class ensuring the other classes are removed:

	ActiveElement.defineDescriptor(elTrafficLights, 'color', {
		type: 'mode',
		property: ['red', 'yellow', 'green']
	});
	elTrafficLights.color = 'red';
	elTrafficLights.color = 'yellow';
	elTrafficLights.color; // 'yellow'
	

helpers
----------
Some convenience methods for building descriptors

	ActiveElement.html({...}) -> {
		type: 'property',
		name: 'innerHTML',
		...
	}

	ActiveElement.text({...}) -> {
		type: 'property',
		name: 'textContent',
		...
	}

	ActiveElement.cls({...}) -> {type: 'class', ...}

