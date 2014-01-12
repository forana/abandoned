
/******** thirdparty/CocoonJS.js ********/
(function()
{
	// There should not be a CocoonJS object when this code is executed.
	// if (typeof window.CocoonJS !== 'undefined') throw("This is strange, a CocoonJS object already exists when trying to create it.");

	/**
	* The basic object for all the CocoonJS related specific APIs === extensions.
	* @namespace
	*/
	CocoonJS = window.CocoonJS ? window.CocoonJS : {};

	CocoonJS.nativeExtensionObjectAvailable = typeof window.ext !== 'undefined';

	/**
	* This type represents a 2D size structure with horizontal and vertical values.
	* @namespace
	*/
	CocoonJS.Size =
	{
		/**
		* The horizontal size value.
		*/
		width : 0,

		/**
		* The vertical size value.
		*/
		height : 0
	};

	/**
	* This utility function allows to create an object oriented like hierarchy between two functions using their prototypes.
	* This function adds a "superclass" and a "__super" attributes to the subclass and it's functions to reference the super class.
	* @param {function} subc The subclass function.
	* @param {function} superc The supercall function.
	*/
	CocoonJS.extend = function(subc, superc) 
	{
		var subcp = subc.prototype;

		// Class pattern.
		var CocoonJSExtendHierarchyChainClass = function() {};
		CocoonJSExtendHierarchyChainClass.prototype = superc.prototype;

		subc.prototype = new CocoonJSExtendHierarchyChainClass();       // chain prototypes.
		subc.superclass = superc.prototype;
		subc.prototype.constructor = subc;

		// Reset constructor. See Object Oriented Javascript for an in-depth explanation of this.
		if (superc.prototype.constructor === Object.prototype.constructor) 
		{
			superc.prototype.constructor = superc;
		}

		// Check all the elements in the subclass prototype and add them to the chain object's prototype.
		for (var method in subcp) 
		{
			if (subcp.hasOwnProperty(method)) 
			{
				subc.prototype[method] = subcp[method];

				// // tenemos en super un metodo con igual nombre.
				// if ( superc.prototype[method]) 
				// {
				//     subc.prototype[method]= (function(fn, fnsuper) 
				//     {
				//         return function() 
				//         {
				//             var prevMethod= this.__super;

				//             this.__super= fnsuper;

				//             var retValue= fn.apply(
				//                     this,
				//                     Array.prototype.slice.call(arguments) );

				//             this.__super= prevMethod;

				//             return retValue;
				//         };
				//     })(subc.prototype[method], superc.prototype[method]);
				// }
			}
		}
	}


	/**
	* This function allows a call to the native extension object function reusing the same arguments object.
	* Why is interesting to use this function instead of calling the native object's function directly?
	* As the CocoonJS object functions expicitly receive parameters, if they are not present and the native call is direcly mapped,
	* undefined arguments are passed to the native side. Some native functions do not check the parameters validation
	* correctly (just check the number of parameters passed).
	* Another solution instead of using this function call is to correctly check if the parameters are valid (not undefined) to make the
	* call, but it takes more work than using this approach.
	* @static
	* @param {string} nativeExtensionObjectName The name of the native extension object name. The object that is a member of the 'ext' object.
	* @param {string} nativeFunctionName The name of the function to be called inside the native extension object.
	* @param {object} arguments The arguments object of the CocoonJS extension object function. It contains all the arguments passed to the CocoonJS extension object function and these are the ones that will be passed to the native call too.
	* @param {boolean} [async] A flag to indicate if the makeCall (false or undefined) or the makeCallAsync function should be used to perform the native call.
	* @returns Whatever the native function call returns.
	*/
	CocoonJS.makeNativeExtensionObjectFunctionCall = function(nativeExtensionObjectName, nativeFunctionName, arguments, async)
	{
		if (CocoonJS.nativeExtensionObjectAvailable)
		{
			var argumentsArray = Array.prototype.slice.call(arguments);
			argumentsArray.unshift(nativeFunctionName);
			var nativeExtensionObject = ext[nativeExtensionObjectName];
			var makeCallFunction = async ? nativeExtensionObject.makeCallAsync : nativeExtensionObject.makeCall;
			var ret = makeCallFunction.apply(nativeExtensionObject, argumentsArray);
			var finalRet = ret;
			if (typeof ret === "string")
			{
				try
				{
					finalRet = JSON.parse(ret);
				}
				catch(error)
				{
				}
			}
			return finalRet;
		}
	};

	/**
	* Returns an object retrieved from a path specified by a dot specified text path starting from a given base object.
	* @param {Object} baseObject The object to start from to find the object using the given text path.
	* @param {string} objectPath The path in the form of a text using the dot notation. i.e. "document.body"
	* For example:
	* var body = getObjectFromPath(window, "document.body");
	*/
	CocoonJS.getObjectFromPath = function(baseObject, objectPath)
	{
		var parts = objectPath.split('.');
		var obj = baseObject;
		for (var i = 0, len = parts.length; i < len; ++i) 
		{
			obj[parts[i]] = obj[parts[i]] || undefined;
			obj = obj[parts[i]];
		}
		return obj;
	};

	/**
	* Finds a string inside a given array of strings by looking for a given substring. It can also
	* specify if the search must be performed taking care or not of the case sensitivity.
	* @param {Array} stringArray The array of strings in which to to look for the string.
	* @param {string} subString The substring to look for inside all the strings of the array.
	* @param {boolean} caseSensitive A flag to indicate if the search must be performed taking case of the 
	* case sensitiveness (true) or not (false).
	* @return {string} The string that has been found or null if the substring is not inside any of the string of the array.
	*/
	CocoonJS.findStringInStringArrayThatIsIndexOf = function(stringArray, subString, caseSensitive)
	{
		var foundString = null;
		subString = caseSensitive ? subString : subString.toUpperCase();
		for (var i = 0; foundString == null && i < stringArray.length; i++)
		{
			foundString = caseSensitive ? stringArray[i] : stringArray[i].toUpperCase();
			foundString = foundString.indexOf(subString) >= 0 ? stringArray[i] : null; 
		}
		return foundString;
	};

	/**
	* A class that represents objects to handle events. Event handlers have always the same structure:
	* A addEventListener and a removeEventListener functions.
	* Both functions receive a callback function that will be added or removed. All the added callback
	* functions will be called when the event takes place.
	* @constructor
	* @param {string} nativeExtensionObjectName
	* @param {string} cocoonJSExtensionObjectName
	* @param {string} nativeEventName
	* @param {number} chainFunction An optional function used to preprocess the listener callbacks
	*/
	CocoonJS.EventHandler = function(nativeExtensionObjectName, cocoonJSExtensionObjectName, nativeEventName, chainFunction)
	{
		this.listeners = [];
		this.listenersOnce = [];
		this.chainFunction = chainFunction;

		/**
		* Adds a callback function so it can be called when the event takes place.
		* @param {function} listener The callback function to be added to the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
		*/
		this.addEventListener = function(listener)
		{
			if (chainFunction) {
				var f = function() {chainFunction.call(this,arguments.callee.sourceListener,Array.prototype.slice.call(arguments)); };
				listener.CocoonJSEventHandlerChainFunction = f;
				f.sourceListener = listener;
				listener = f;
			}

			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
			if (cocoonJSExtensionObject && cocoonJSExtensionObject.nativeExtensionObjectAvailable)
			{
				ext[nativeExtensionObjectName].addEventListener(nativeEventName, listener);
			}
			else
			{
				var indexOfListener = this.listeners.indexOf(listener);
				if (indexOfListener < 0)
				{
					this.listeners.push(listener);
				}
			}
		};

		this.addEventListenerOnce = function(listener)
		{
			if (chainFunction) {
				var f = function() { chainFunction(arguments.callee.sourceListener,Array.prototype.slice.call(arguments)); };
				f.sourceListener = listener;
				listener = f;
			}

			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
			if (cocoonJSExtensionObject.nativeExtensionObjectAvailable)
			{
				ext[nativeExtensionObjectName].addEventListenerOnce(nativeEventName, listener);
			}
			else
			{
				var indexOfListener = this.listeners.indexOf(listener);
				if (indexOfListener < 0)
				{
					this.listenersOnce.push(listener);
				}
			}
		};

		/**
		 * Removes a callback function that was added to the event handler so it won't be called when the event takes place.
		 * @param {function} listener The callback function to be removed from the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
		 */
		this.removeEventListener = function (listener) {

			if (chainFunction) {
				listener = listener.CocoonJSEventHandlerChainFunction;
				delete listener.CocoonJSEventHandlerChainFunction;
			}

			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
			if (cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
				ext[nativeExtensionObjectName].removeEventListener(nativeEventName, listener);
			}
			else {
				var indexOfListener = this.listeners.indexOf(listener);
				if (indexOfListener >= 0) {
					this.listeners.splice(indexOfListener, 1);
				}
			}
		};

		this.notifyEventListeners = function() {
			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
			if (cocoonJSExtensionObject && cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
				ext[nativeExtensionObjectName].notifyEventListeners(nativeEventName);
			} else {

				var argumentsArray= Array.prototype.slice.call(arguments);
				var listeners =     Array.prototype.slice.call(this.listeners);
				var listenersOnce = Array.prototype.slice.call(this.listenersOnce);
				var _this = this;
				// Notify listeners after a while ;) === do not block this thread.
				setTimeout(function() {
					for (var i = 0; i < listeners.length; i++) {
						listeners[i].apply(_this, argumentsArray);
					}
					for (var i = 0; i < listenersOnce.length; i++) {
						listenersOnce[i].apply(_this, argumentsArray);
					}
				}, 0);

				_this.listenersOnce= [];
			}
		};
		return this;
	};

	/**
	* A simple timer class. Update it every loop iteration and get values from accumulated time to elapsed time in seconds or milliseconds.
	*/
	CocoonJS.Timer = function() {
		this.reset();
		return this;
	};

	CocoonJS.Timer.prototype = {
		currentTimeInMillis : 0,
		lastTimeInMillis : 0,
		elapsedTimeInMillis : 0,
		elapsedTimeInSeconds : 0,
		accumTimeInMillis : 0,

		/**
		Resets the timer to 0.
		*/
		reset : function() {
			this.currentTimeInMillis = this.lastTimeInMillis = new Date().getTime();
			this.accumTimeInMillis = this.elapsedTimeInMillis = this.elapsedTimeInSeconds = 0;
		},

		/**
		Updates the timer calculating the elapsed time between update calls.
		*/
		update : function() {
			this.currentTimeInMillis = new Date().getTime();
			this.elapsedTimeInMillis = this.currentTimeInMillis - this.lastTimeInMillis;
			this.elapsedTimeInSeconds = this.elapsedTimeInMillis / 1000.0;
			this.lastTimeInMillis = this.currentTimeInMillis;
			this.accumTimeInMillis += this.elapsedTimeInMillis;
		}
	};

	/**
	* A class that represents a Frames Per Second counter. It relied in CocoonJS.Timer to do the time calculation.
	*/
	CocoonJS.FPSCounter = function() {
		this.timer = new CocoonJS.Timer();
		this.reset();
		return this;
	};

	CocoonJS.Timer.prototype = {
		timer : 0,
		fps : 0,
		averageFPS : 0,

		reset : function()
		{
			this.timer.reset();
			this.fps = 0;
			this.averageFPS = 0;
		},

		update : function()
		{
			this.timer.update();
			this.fps++;
			if (this.timer.accumTimeInMillis >= 1000) {
				this.averageFPS = this.fps;
				this.fps = 0;
				this.timer.reset();
			}
		}
	};

	// CocoonJS.FindAllNativeBindingsInCocoonJSExtensionObject = function(cocoonJSExtensionObject, nativeFunctionBindingCallback, nativeEventBindingCallback)
	// {
	// 	for (var cocoonJSExtensionObjectAttributeName in cocoonJSExtensionObject)
	// 	{
	// 		var cocoonJSExtensionObjectAttribute = cocoonJSExtensionObject[cocoonJSExtensionObjectAttributeName];

	// 		// Function
	// 		if (typeof cocoonJSExtensionObjectAttribute === 'function' && typeof cocoonJSExtensionObjectAttribute.nativeFunctionName !== 'undefined')
	// 		{
	// 			var nativeFunctionName = cocoonJSExtensionObjectAttribute.nativeFunctionName;
	// 			nativeFunctionBindingCallback(cocoonJSExtensionObjectAttributeName, nativeFunctionName);
	// 		}
	// 		// Event object
	// 		else if (typeof cocoonJSExtensionObjectAttribute === 'object' && cocoonJSExtensionObjectAttribute !== null && typeof cocoonJSExtensionObjectAttribute.nativeEventName !== 'undefined')
	// 		{
	// 			var nativeEventName = cocoonJSExtensionObjectAttribute.nativeEventName;
	// 			nativeEventBindingCallback(cocoonJSExtensionObjectAttributeName, nativeEventName);
	// 		}
	// 	}
	// }

	/**
	This function looks for a CocoonJS extension object that is bound to the given native ext object name.
	@returns The CocoonJS extension object that corresponds to the give native extension object name or null if it cannot be found.
	*/
	// CocoonJS.GetCocoonJSExtensionObjectForNativeExtensionObjectName = function(nativeExtensionObjectName)
	// {
	// 	var cocoonJSExtensionObject = null;
	// 	// Look in the CocoonJS object and for every object that is a CocoonJS.Extension check if it's nativeExtensionObjectName matches to the one passed as argument. If so, create an object that will represent it's documentation for the native ext object.
	// 	for (var cocoonJSAttributeName in CocoonJS)
	// 	{
	// 		var cocoonJSAttribute = CocoonJS[cocoonJSAttributeName];
	// 		if (typeof cocoonJSAttribute === 'object' && cocoonJSAttribute instanceof CocoonJS.Extension && cocoonJSAttribute.nativeExtensionObjectName === nativeExtensionObjectName)
	// 		{
	// 			// We have found the CocoonJS object that represents the native ext extension object name. 
	// 			cocoonJSExtensionObject = cocoonJSAttribute;
	// 			break;
	// 		}
	// 	}
	// 	return cocoonJSExtensionObject;
	// };

	/**
	This function adds functions to a CocoonJS extension object in order to bind them to the native makeCall function calls of the ext object.

	@param extensionObject The reference to the CocoonJS extension object where to add the new functions bound to the ext object makeCall functions calls.

	@param nativeFunctionsConfiguration An array of objects with the following structure:

		{ nativeFunctionName : "" [, functionName : "", isAsync : true/false] }

		- nativeFunctionName: Specifies the name of the function inside the ext object makeCall function call that will be bound.
		- functionName: An optional attribute that allows to specify the name of the function to be added to the CocoonJS extension object. If is not present, the name of the function will be the same
		as the nativeFunctionName.
		- isAsync: An optional attribute that allows to specify if the call should be performed using makeCall (false or missing) or makeCallAsync (true).
		- alternativeFunction: An optional attribute that allows to specify an alternative function that will be called internally when this function is called. This attribute
		allows for adding new functionalities like for example adding methods 

	@returns The CocoonJS extension object.
	*/
	// CocoonJS.AddNativeFunctionBindingsToExtensionObject = function(extensionObject, nativeFunctionsConfiguration)
	// {
	// 	if (typeof extensionObject === 'undefined' || extensionObject === null) throw("The passed extension object be a valid object.");
	// 	if (typeof nativeFunctionsConfiguration === 'undefined' || nativeFunctionsConfiguration === null) throw("The passed native functions configuration array must be a valid object.");

	// 	for (var i = 0; i < nativeFunctionsConfiguration.length; i++)
	// 	{
	// 		if (typeof nativeFunctionsConfiguration[i].nativeFunctionName === 'undefined') throw("The 'nativeFunctionName' attribute in the native function configuration object at index '" + i + "' in the native function configuration array cannot be undefined.");
	// 		var nativeFunctionName = nativeFunctionsConfiguration[i].nativeFunctionName;
	// 		var functionName = typeof nativeFunctionsConfiguration[i].functionName !== 'undefined' ? nativeFunctionsConfiguration[i].functionName : nativeFunctionName;
	// 		var makeCallFunction = null;
	// 		makeCallFunction = typeof nativeFunctionsConfiguration[i].isAsync !== 'undefined' && nativeFunctionsConfiguration[i].isAsync ? extensionObject.nativeExtensionObject.makeCallAsync : extensionObject.nativeExtensionObject.makeCall;
	// 		// Add the new function to the CocoonJS extension object
	// 		extensionObject[functionName] = function()
	// 		{
	// 			// Convert the arguments object to an array
	// 			var arguments = Array.prototype.slice.call(arguments);
	// 			// Add the native function name as the first parameter
	// 			arguments.unshift(nativeFunctionName);
	// 			// Make the native ext object call
	// 			var result = makeCallFunction.apply(extensionObject.nativeExtensionObject, arguments);
	// 			return result;
	// 		}
	// 		// Add a property to the newly added function to store the name of the original function.
	// 		extensionObject[functionName].nativeFunctionName = nativeFunctionName;
	// 	}
	// 	return extensionObject;
	// };

	/**
	This function adds objects to a CocoonJS extension object to allow event listener handling (add and remove) bound to the native ext object event listener handling.

	@param extensionObject The reference to the CocoonJS extension object where to add the new objects bound to the ext object event listener handling.

	@param nativeEventsConfiguration An array of objects with the following structure:

		{ nativeEventName : "" [, eventObjectName : ""] }

		- nativeEventName: Specifies the event in the native ext object to be bound.
		- eventObjectName: An optional attribute that allows to specify the name of the object to be added to the CocoonJS extension object. If is not present, the name of the function will be the same
		as the nativeEventName.
		- alternativeAddEventListenerFunction:
		- alternativeRemoveEventListenerFunction:

	@returns The CocoonJS extension object.
	*/
	// CocoonJS.AddNativeEventBindingsToExtensionObject = function(extensionObject, nativeEventsConfiguration)
	// {
	// 	if (typeof extensionObject === 'undefined' || extensionObject === null) throw("The passed extension object be a valid object.");
	// 	if (typeof nativeEventsConfiguration === 'undefined' || nativeEventsConfiguration === null) throw("The passed native events configuration array must be a valid object.");

	// 	for (var i = 0; i < nativeEventsConfiguration.length; i++)
	// 	{
	// 		if (typeof nativeEventsConfiguration[i].nativeEventName === 'undefined') throw("The 'nativeEventName' attribute in the native event configuration object at index '" + i + "' in the native event configuration array cannot be undefined.");
	// 		var nativeEventName = nativeEventsConfiguration[i].nativeEventName;
	// 		var eventObjectName = typeof nativeEventsConfiguration[i].eventObjectName !== 'undefined' ? nativeEventsConfiguration[i].eventObjectName : nativeEventName;
	// 		// Anonymous function call so each variable in the loop is used in the event listener handling function bindings.
	// 		(function(nativeEventName, eventObjectName)
	// 		{
	//     		extensionObject[eventObjectName] =
	//     		{
	//     			// Store the native event name
	//     			nativeEventName : nativeEventName,
	//     			// Create the event listener management functions bound to the native counterparts
	//     			addEventListener : function(callback)
	// 	    		{
	// 	    			extensionObject.nativeExtensionObject.addEventListener(nativeEventName, callback);
	//     			},
	//     			removeEventListener : function(callback)
	//     			{
	// 	    			extensionObject.nativeExtensionObject.removeEventListener(nativeEventName, callback);
	//     			}
	//     			// ,
	//     			// removeAllEventListeners : function()
	//     			// {

	//     			// }
	//     		};
	// 		})(nativeEventName, eventObjectName);
	// 	}
	// 	return extensionObject;
	// };

	/**
	The function object constructor function all the CocoonJS extensions can use to instantiate the CocoonJS extension object and add all the functionality needed bound to the native ext object.

	@param nativeExtensionObject The reference to the ext object extension object.

	@param nativeFunctionsConfiguration See CocoonJS.AddNativeFunctionBindingsToExtensionObject function's documentation for more details.

	@param nativeEventsConfiguration See CocoonJS.AddNativeEventBindingsToExtensionObject function's documentation for more details.

	@returns The new CocoonJS extension object.
	*/
	// CocoonJS.Extension = function(nativeExtensionObjectName, nativeFunctionsConfiguration, nativeEventsConfiguration)
	// {
	// 	if (typeof nativeExtensionObjectName === 'undefined' || nativeExtensionObjectName === null) throw("The native extension object name cannot be null");

	// 	if (window.ext[nativeExtensionObjectName] === 'undefined') throw("The given native extension object name '" + nativeExtensionObjectName + "' is incorrect or the native extension object is undefined.");

	// 	var nativeExtensionObject = window.ext[nativeExtensionObjectName];

	// 	// Store a reference to the native extension object and to it's name
	// 	this.nativeExtensionObject = nativeExtensionObject;
	// 	this.nativeExtensionObjectName = nativeExtensionObjectName;

	// 	// If native function configuration is passed, use it to add some functions to the new extension object.
	// 	if (typeof nativeFunctionsConfiguration !== 'undefined')
	// 	{
	// 		CocoonJS.AddNativeFunctionBindingsToExtensionObject(this, nativeFunctionsConfiguration);
	// 	}

	// 	// If native event configuration is passed, use it to add some event objects to the new extension object.
	// 	if (typeof nativeEventsConfiguration !== 'undefined')
	// 	{
	// 		CocoonJS.AddNativeEventBindingsToExtensionObject(this, nativeEventsConfiguration);
	// 	}

	// 	return this;
	// };   

})();

	
/******** thirdparty/CocoonJS_App.js ********/
(function()
{
	// The CocoonJS must exist before creating the extension.
	if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

	/**
	* This namespace represents all the basic functionalities available in the CocoonJS extension API.
	* @namespace
	*/
	CocoonJS.App = CocoonJS.App ? CocoonJS.App : {};

	CocoonJS.App.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.IDTK_APP !== 'undefined';

	CocoonJS.App.FPSLayout =
	{
		TOP_LEFT : 'top-left',
		TOP_RIGHT : 'top-right',
		BOTTOM_LEFT : 'bottom-left',
		BOTTOM_RIGHT : 'bottom-right'
	};

	/**
	* Contains all the possible values to specify the input keyboard type to be used when introducing text.
	* @namespace
	*/
	CocoonJS.App.KeyboardType =
	{
		/**
		* Represents a generic text input keyboard.
		*/
		TEXT : "text",

		/**
		* Represents a number like input keyboard.
		*/
		NUMBER : "num",

		/**
		* Represents a phone like input keyboard.
		*/
		PHONE : "phone",

		/**
		* Represents an email like input keyboard.
		*/
		EMAIL : "email",

		/**
		* Represents an URL like input keyboard.
		*/
		URL : "url"
	};

	/**
	* The storage types to be used with file system related operations.
	* @namespace
	*/
	CocoonJS.App.StorageType = 
	{
		/**
		* Represents the application storage. The application storage is the place where all the resources that come with the application are stored.
		*/
		APP_STORAGE : "APP_STORAGE", 

		/**
		* Represents the internal storage. The internal storage is a different storage space that the application storage and only the data that the application has stored
		* in it will be in this storage. It is internal to the platform/device.
		*/
		INTERNAL_STORAGE : "INTERNAL_STORAGE",

		/**
		* Represents an external storage. The external storage is similar to the internal storage in the sense that it only contains information that the application has written
		* in it but it represents an external storage device like a SD-CARD. If there is no exrernal storage, it will represent the same as the internal storage.
		*/
		EXTERNAL_STORAGE : "EXTERNAL_STORAGE",

		/**
		* Represents the temporal storage. Same as the internal and external storage spaces in the sense that it only contains information that the application has written
		* in it but the main difference is that the information in this storage may dissapear without notice.
		*/
		TEMPORARY_STORAGE : "TEMPORARY_STORAGE"    
	};

	/**
	* Makes a forward call of some javascript code to be executed in a different environment (i.e. from CocoonJS to the WebView and viceversa).
	* It waits until the code is executed and the result of it is returned.
	* @static
	* @param {string} javaScriptCode Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from CocoonJS to the WebView and viceversa).
	* @return The result of the execution of the passed JavaScript code in the different JavaScript environment.
	*/
	CocoonJS.App.forward = function(javaScriptCode)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "forward", arguments);
		}
		else if (!navigator.isCocoonJS)
		{
			if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame')
			{
				window.parent.eval(javaScriptCode);
			}
			else
			{
				window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode);
			}
		}
	};

	/**
	* Makes a forward call of some javascript code to be executed in a different environment (i.e. from CocoonJS to the WebView and viceversa).
	* It is asyncrhonous so it does not wait until the code is executed and the result of it is returned. Instead, it calls a callback function when the execution has finished to pass the result.
	* @static
	* @param {string} javaScriptCode Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from CocoonJS to the WebView and viceversa).
	* @param {function} [returnCallback] A function callback that will be called when the passed JavaScript code is executed in a different thread to pass the result of the execution in the different JavaScript environment.
	*/
	CocoonJS.App.forwardAsync = function(javaScriptCode, returnCallback)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			if (typeof returnCallback !== 'undefined')
			{
				return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode, returnCallback);
			}
			else
			{
				return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode);
			}
		}
		else if (!navigator.isCocoonJS)
		{
			if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame')
			{
				window.parent.eval(javaScriptCode);
			}
			else
			{
				window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode);
			}
		}
	};

	/**
	* Pops up a text dialog so the user can introduce some text and the application can get it back. It is the first approach CocoonJS has taken to be able to introduce 
	* text input in a easy way. The dialog execution events are passed to the application through the {@link CocoonJS.App.onTextDialogFinished} and the {@link CocoonJS.App.onTextDialogCancelled} event objects.
	* @param {string} [title] Default value is "". The title to be displayed in the dialog.
	* @param {string} [message] Default value is "". The message to be displayed in the dialog, next to the text input field.
	* @param {string} [text] Default value is "". The initial text to be introduced in the text input field.
	* @param {CocoonJS.App.KeyboardType} [keyboardType] Default value is {@link CocoonJS.App.KeyboardType.TEXT}. The keyboard type to be used when the text has to be introduced.
	* @param {string} [cancelButtonText] Default value is "". The text to be displayed in the cancel button of the dialog.
	* @param {string} [okButtonText] Default value is "". The text to be displayed in the ok button of the dialog.
	* @see CocoonJS.App.onTextDialogFinished
	* @see CocoonJS.App.onTextDialogCancelled
	*/
	CocoonJS.App.showTextDialog = function(title, message, text, keyboardType, cancelButtonText, okButtonText)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "showTextDialog", arguments, true);
		}
		else if (!navigator.isCocoonJS)
		{
			if (!message)
			{
				message = "";
			}
			if (!text)
			{
				text = "";
			}
			var result = prompt(message, text);
			var eventObject = result ? CocoonJS.App.onTextDialogFinished : CocoonJS.App.onTextDialogCancelled;
			eventObject.notifyEventListeners(result);
		}
	};

	/**
	* Pops up a message dialog so the user can decide between a yes or no like confirmation. The message box execution events are passed to the application through the {@link CocoonJS.App.onMessageBoxConfirmed} and the {@link CocoonJS.App.onMessageBoxDenied} event objects.
	* @param {string} [title] Default value is "". The title to be displayed in the dialog.
	* @param {string} [message] Default value is "". The message to be displayed in the dialog, next to the text input field.
	* @param {string} [confirmButtonText] Default value is "Yes". The text to be displayed for the confirm button.
	* @param {string} [denyButtonText] Default value is "No". The text to be displayed for the deny button.
	* @see CocoonJS.App.onMessageBoxConfirmed
	* @see CocoonJS.App.onMessageBoxDenied
	*/
	CocoonJS.App.showMessageBox = function(title, message, confirmButtonText, denyButtonText)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "showMessageBox", arguments, true);
		}
		else if (!navigator.isCocoonJS)
		{
			if (!message)
			{
				message = "";
			}
			var result = confirm(message);
			var eventObject = result ? CocoonJS.App.onMessageBoxConfirmed : CocoonJS.App.onMessageBoxDenied;
			eventObject.notifyEventListeners();
		}
	};

	/**
	* It allows to load a new JavaScript/HTML5 resource that can be loaded either locally (inside the platform/device storage) or using a remote URL.
	* @param {string} path A path to a resource stored in the platform or in a URL to a remote resource.
	* @param {CocoonJS.App.StorageType} [storageType] If the path argument represents a locally stored resource, the developer can specify the storage where it is stored. If no value is passes, the {@link CocoonJS.App.StorageType.APP_STORAGE} value is used by default.
	*/
	CocoonJS.App.load = function(path, storageType)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "loadPath", arguments);
		}
		else if (!navigator.isCocoonJS)
		{
			var xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function(event) {
				if (xhr.readyState === 4)
				{
					if (xhr.status === 200)
					{
						// TODO: As window load event is not being called (WHY???), I have decided to call the listeners directly
						// var callback= function(event){
						//     window.removeEventListener("load", callback);
							var jsCode;
							// If there is no webview, it means we are in the webview, so notify the CocoonJS environment
							if (!CocoonJS.App.EmulatedWebViewIFrame)
							{
								jsCode = "CocoonJS.App.onLoadInTheWebViewSucceed.notifyEventListeners('" + path + "');";
							}
							// If there is a webview, it means we are in CocoonJS, so notify the webview environment
							else 
							{
								jsCode = "CocoonJS.App.onLoadInCocoonJSSucceed.notifyEventListeners('" + path + "');";
							}
							CocoonJS.App.forwardAsync(jsCode);
						// };
						// window.addEventListener("load", callback);
						window.location.href = path;
					}
					else if (xhr.status === 404)
					{
						this.onreadystatechange = null;
							var jsCode;
							// If there is no webview, it means we are in the webview, so notify the CocoonJS environment
							if (!CocoonJS.App.EmulatedWebViewIFrame)
							{
								jsCode = "CocoonJS.App.onLoadInTheWebViewFailed.notifyEventListeners('" + path + "');";
							}
							// If there is a webview, it means we are in CocoonJS, so notify the webview environment
							else 
							{
								jsCode = "CocoonJS.App.onLoadInCocoonJSFailed.notifyEventListeners('" + path + "');";
							}
							CocoonJS.App.forwardAsync(jsCode);
					}
				}
			};
			xhr.open("GET", path, true);
			xhr.send();
		}
	};

	/**
	* Opens a given URL using a system service that is able to open it. For example, open a HTTP URL using the system WebBrowser.
	* @param {string} url The URL to be opened by a system service.
	*/
	CocoonJS.App.openURL = function(url)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "openURL", arguments, true);
		}
		else if (!navigator.isCocoonJS)
		{
			window.open(url, '_blank');
		}
	}

	/**
	* Forces the app to be finished.
	*/
	CocoonJS.App.forceToFinish = function()
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "forceToFinish", arguments);
		}
		else if (!navigator.isCocoonJS)
		{
			window.close();
		}
	}

	/**
	* Creates a canvas element that is automatically resized to the screen size. When the app is being executed
	* inside CocoonJS. This canvas is optimized for rendering so it is higly recommended to use it if it fits
	* your app needs. If your app uses one canvas as the main canvas where all other canvases and images are displayed, Ludei recommends to 
	* call this function in order to create this main canvas. A usual 2x performance gain is achieved by doing so
	* depending on the device and the graphics card driver. 
	* @return The canvas object that should be used as the main canvas and that is resized to the screen resolution.
	*/
	CocoonJS.App.createScreenCanvas = function()
	{
		var screenCanvas;
		if (navigator.isCocoonJS)
		{
			screenCanvas = document.createElement("screencanvas");
		}
		else if (!navigator.isCocoonJS)
		{
			screenCanvas = document.createElement("canvas");
			screenCanvas.width = window.innerWidth;
			screenCanvas.height = window.innerHeight;
		}
		return screenCanvas;
	};

	/**
	* Disables the touch events in the CocoonJS environment.
	*/
	CocoonJS.App.disableTouchInCocoonJS = function()
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			window.ext.IDTK_APP.makeCall("disableTouchLayer", "CocoonJSView");
		}
	};

	/**
	* Enables the touch events in the CocoonJS environment.
	*/
	CocoonJS.App.enableTouchInCocoonJS = function()
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			window.ext.IDTK_APP.makeCall("enableTouchLayer", "CocoonJSView");
		}
	};

	/**
	* Disables the touch events in the WebView environment.
	*/
	CocoonJS.App.disableTouchInTheWebView = function()
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			window.ext.IDTK_APP.makeCall("disableTouchLayer", "WebView");
		}
	};

	/**
	* Enables the touch events in the WebView environment.
	*/
	CocoonJS.App.enableTouchInTheWebView = function()
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			window.ext.IDTK_APP.makeCall("enableTouchLayer", "WebView");
		}
	};

	/**
	* Setups the update interval in seconds (1 second / X frames) to receive the accelerometer updates.
	* It defines the rate at which the devicemotion events are updated.
	* @param {number} updateIntervalInSeconds The update interval in seconds to be set.
	*/
	CocoonJS.App.setAccelerometerUpdateIntervalInSeconds = function(updateIntervalInSeconds)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return window.ext.IDTK_APP.makeCall("setAccelerometerUpdateIntervalInSeconds", updateIntervalInSeconds);
		}
	};

	/**
	* Returns the update interval in seconds that is currently set for accelerometer related events.
	* @return The update interval in seconds that is currently set for accelerometer related events.
	*/
	CocoonJS.App.getAccelerometerUpdateIntervalInSeconds = function()
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return window.ext.IDTK_APP.makeCall("getAccelerometerUpdateIntervalInSeconds");
		}
	};

	/**
	* Setups the update interval in seconds (1 second / X frames) to receive the gyroscope updates.
	* It defines the rate at which the devicemotion and deviceorientation events are updated.
	* @param {number} updateIntervalInSeconds The update interval in seconds to be set.
	*/
	CocoonJS.App.setGyroscopeUpdateIntervalInSeconds = function(updateIntervalInSeconds)
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			return window.ext.IDTK_APP.makeCall("setGyroscopeUpdateIntervalInSeconds", updateIntervalInSeconds);
		}
	};

	/**
	* Returns the update interval in seconds that is currently set for gyroscope related events.
	* @return The update interval in seconds that is currently set for gyroscope related events.
	*/
	CocoonJS.App.getGyroscopeUpdateIntervalInSeconds = function()
	{
		if (CocoonJS.App.nativeExtensionObjectAvailable)
		{
			window.ext.IDTK_APP.makeCall("getGyroscopeUpdateIntervalInSeconds");
		}
	};

	/**
	* FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onTextDialogFinished} event calls.
	* @name OnTextDialogFinishedListener
	* @function
	* @static
	* @memberOf CocoonJS.App
	* @param {string} text The text that was introduced in the text dialog when it was finished.
	*/

	/**
	* This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by accepting it's content.
	* The callback function's documentation is represented by {@link CocoonJS.App.OnTextDialogFinishedListener}
	* @static
	*/
	CocoonJS.App.onTextDialogFinished = new CocoonJS.EventHandler("IDTK_APP", "App", "ontextdialogfinish");

	/**
	* This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by dismissing it's content.
	* The callback function does not receive any parameter.
	* @static
	*/
	CocoonJS.App.onTextDialogCancelled = new CocoonJS.EventHandler("IDTK_APP", "App", "ontextdialogcancel");

	/**
	* This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by accepting it's content.
	* The callback function does not receive any parameter.
	* @static
	*/
	CocoonJS.App.onMessageBoxConfirmed = new CocoonJS.EventHandler("IDTK_APP", "App", "onmessageboxconfirmed");

	/**
	* This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by dismissing it's content.
	* The callback function does not receive any parameter.
	* @static
	*/
	CocoonJS.App.onMessageBoxDenied = new CocoonJS.EventHandler("IDTK_APP", "App", "onmessageboxdenied");

	/**
	* This {@link CocoonJS.EventHandler} object allows listening to events called when the application is suspended.
	* The callback function does not receive any parameter.
	* @static
	*/
	CocoonJS.App.onSuspended = new CocoonJS.EventHandler("IDTK_APP", "App", "onsuspended");

	/**
	* This {@link CocoonJS.EventHandler} object allows listening to events called when the application is activated.
	* The callback function does not receive any parameter.
	* @static
	*/
	CocoonJS.App.onActivated = new CocoonJS.EventHandler("IDTK_APP", "App", "onactivated");
	
})();
/******** thirdparty/underscore-1.4.4.js ********/
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.4";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2),e=w.isFunction(t);return w.map(n,function(n){return(e?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t,r){return w.isEmpty(t)?r?null:[]:w[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.findWhere=function(n,t){return w.where(n,t,!0)},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var k=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=k(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var F=function(n,t,r,e){var u={},i=k(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return F(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return F(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i},w.bind=function(n,t){if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));var r=o.call(arguments,2);return function(){return n.apply(t,r.concat(o.call(arguments)))}},w.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},w.bindAll=function(n){var t=o.call(arguments,1);return 0===t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var I=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=I(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&I(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return I(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),"function"!=typeof/./&&(w.isFunction=function(n){return"function"==typeof n}),w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return n===void 0},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};M.unescape=w.invert(M.escape);var S={escape:RegExp("["+w.keys(M.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(M.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(S[n],function(t){return M[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=++N+"";return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var T=/(.)^/,q={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){var e;r=w.defaults({},r,w.templateSettings);var u=RegExp([(r.escape||T).source,(r.interpolate||T).source,(r.evaluate||T).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(B,function(n){return"\\"+q[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,w);var c=function(n){return e.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},w.chain=function(n){return w(n).chain()};var D=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
/******** util/imagecache.js ********/
ImageCache = {
    images: {},

    get: function(path) {
        if (!(path in this.images)) {
            var image = new Image();
            image.src = path;
            this.images[path] = image;
        }

        return this.images[path];
    }
};
/******** util/audiocache.js ********/
var AudioWrapper = function(path) {
	this.element = document.createElement("audio");
	this.element.src = path;
	this.element.load();

	this.play = function() {
		if (UserData.settings[SettingKeys.GLOBAL_MUTE] !== true) {
			var clone = this.element.cloneNode();
			clone.addEventListener("ended", function() {
				delete clone.src;
			});
			clone.play();
			if (navigator.isCocoonJS) {
				clone.src = this.element.src;
			}
		}
	};

	this.unload = function() {
		delete this.element.src;
	};
};

AudioCache = function() {
	this.cache = {};

	this.get = function(path) {
		if (!(this.cache[path])) {
			this.cache[path] = new AudioWrapper(path);
		}
		return this.cache[path];
	};

	this.clear = function() {
		_.each(this.cache, function(wrapper) {
			wrapper.unload();
		});
	};
}
/******** shim/polyfill.js ********/
if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || (function () {
		alert("Your browser is not modern enough for this - please install the latest version of whatever it is");
		throw "I'm sorry :(";
	})();
}

if (!navigator.vibrate) {
	navigator.vibrate = function (pattern) {
	};
}

/******** framework/core.js ********/
GameCore = {
	canvas: document.createElement(navigator.isCocoonJS ? "screencanvas" : "canvas"),
	context: null,

	UPDATES_PER_SECOND: 25,

	timer: null,

	screen: null,

	start: function() {
		this.resizeCanvas();
		var self = this;
		window.addEventListener("resize", function() {
			self.resizeCanvas();
		});

		this.context = this.canvas.getContext("2d");
		document.body.appendChild(this.canvas);

		this.canvas.addEventListener("mouseup", function(e) {
			self.delegateClick(e.pageX, e.pageY);
		});
		this.canvas.addEventListener("touchend", function(e) {
			self.delegateClick(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		this.updateInterval = window.setInterval(function() {
			self.update();
		}, 1000/this.UPDATES_PER_SECOND);

		this.render();
	},

	resizeCanvas: function() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.screen && this.screen.updateDimensions(this.getWidth(), this.getHeight());
	},

	getWidth: function() {
		return this.canvas.width;
	},

	getHeight: function() {
		return this.canvas.height;
	},

	setScreen: function(newScreen) {
		this.screen = newScreen;
	},

	update: function() {
		this.screen.update(this);
	},

	render: function() {
		var self = this;
		window.requestAnimationFrame(function () {
			self.render();
		});

		this.screen.render(this.context);
	},

	delegateClick: function(x, y) {
		this.screen.handleClick(x, y);
	}
};

/******** framework/screen.js ********/
Screen = {
	needsRepaint: function() {
		return true;
	},

	render: function(context) {
	},

	update: function(game) {
	},

	updateDimensions: function(width, height) {
	},

	handleClick: function(x, y, game) {
	}
};

/******** words/model.js ********/
Letters = {
	Count: {
		A: 9,
		B: 2,
		C: 2,
		D: 4,
		E: 12,
		F: 2,
		G: 3,
		H: 2,
		I: 8,
		J: 1,
		K: 1,
		L: 4,
		M: 2,
		N: 6,
		O: 8,
		P: 2,
		Qu: 1,
		R: 6,
		S: 4,
		T: 6,
		U: 3,
		V: 2,
		W: 2,
		X: 1,
		Y: 2,
		Z: 1
	},

	Score: {
		A: 1,
		B: 3,
		C: 3,
		D: 2,
		E: 1,
		F: 4,
		G: 2,
		H: 3,
		I: 1,
		J: 8,
		K: 5,
		L: 2,
		M: 3,
		N: 1,
		O: 1,
		P: 3,
		Qu: 6,
		R: 1,
		S: 1,
		T: 1,
		U: 2,
		V: 5,
		W: 4,
		X: 8,
		Y: 4,
		Z: 8
	},

	pickingArray: [],

	pick: function() {
		return this.pickingArray[Math.floor(Math.random() * this.pickingArray.length)];
	}
};

for (var letter in Letters.Count) {
	if (Letters.Count.hasOwnProperty(letter)) {
		var pair = [letter, Letters.Score[letter]];
		for (var i=0; i<Letters.Count[letter]; i++) {
			Letters.pickingArray.push(pair);
		}
	}
}

/******** words/tile.js ********/
Tile = function(model) {
	this.rep = model[0];
	this.value = model[1];

	this.offset = 0;
	this.image = ImageCache.get("resources/tile.png")

	this.slide = function(dist) {
		this.offset += dist;
	};

	this.update = function(dist) {
		this.offset = Math.max(0, this.offset - dist);
	};

	this.renderBlock = function(context, x, y, width, height) {
		context.fillStyle = "#CCAA99";
		context.drawImage(this.image, x, y, width, height);
	};

	this.renderLargeText = function(context, x, y, width, height, size) {
		var mid = context.measureText(this.rep).width / 2;
		context.fillText(this.rep,
			x + width/2 - mid,
			y + height/2 + size/2);
	};

	this.renderSmallText = function(context, x, y, width, height, size) {
		var mid = context.measureText(this.value).width / 2;
		context.fillText(this.value,
			x + width/2 - mid,
			y + height*0.95);
	};
};

/******** words/rules/baserules.js ********/
BaseRules = {
	getInitialGrid: function(size) {
		var grid = [];
		for (var i = 0; i<size; i++) {
			var col = [];
			for (var j = 0; j<size; j++) {
				col.push(new Tile(Letters.pick()));
			}
			grid.push(col)
		}
		return grid;
	},

	afterMoveMade: function(grid) {
	},

	isGameOver: function(grid, moves) {
		return false;
	}
};

/******** words/rules/turn.js ********/
NTurnRules = function(n) {
	_.extend(this, BaseRules);
	this.numTurns = n;
	this.turn = 0;
}
/******** words/gamescreen.js ********/
GameScreen = function(game, rules) {
	_.extend(this, Screen);

	this.gridSize = 6;
	this.plays = [[], []];
	this.turn = 0;

	this.grid = rules.getInitialGrid(this.gridSize);

	this.update = function(game) {
		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].update(0.1);
			}
		}
	};

	this.updateDimensions = function(width, height) {
		this.xOffset = (width - height) / 2;
		this.sizePerTile = height / this.gridSize;
		this.width = width;
		this.height = height;
		this.largeFontSize = Math.floor(this.sizePerTile / 2);
		this.smallFontSize = Math.floor(this.sizePerTile / 5);
	};

	this.render = function(context) {
		context.fillStyle = "#000000";
		context.fillRect(0, 0, this.width, this.height);

		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].renderBlock(context,
					this.xOffset + i*this.sizePerTile,
					j*this.sizePerTile,
					this.sizePerTile,
					this.sizePerTile
				);
			}
		}

		context.fillStyle = "#333333";
		context.font = this.smallFontSize + "px Helvetica Arial";
		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].renderSmallText(context,
					this.xOffset + i*this.sizePerTile,
					j*this.sizePerTile,
					this.sizePerTile,
					this.sizePerTile,
					this.smallFontSize
				);
			}
		}

		context.fillStyle = "#000000";
		context.font = this.largeFontSize + "px Helvetica Arial";
		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].renderLargeText(context,
					this.xOffset + i*this.sizePerTile,
					j*this.sizePerTile,
					this.sizePerTile,
					this.sizePerTile,
					this.largeFontSize
				);
			}
		}
	};
};

/******** init.js ********/
document.addEventListener("DOMContentLoaded", function() {
	GameCore.setScreen(new GameScreen(GameCore, new NTurnRules(10)));
	GameCore.start();
});

/*** end ***/
