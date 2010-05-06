/***
 * forms.Form
 * Utility for create classes using Javascript object notation. 
 *
 * Required:
 * - For validation, this uses $.validator as of right now.
 * - Molly.js, Molly is the name of the finished framework and contains Javascript native extensions.
 *
 * TODO:
 * - TextArea method
 * - Custom validation methods
 * - Create from datastore
 * 
 * Note:
 * - Though jQuery is included, it is not required to run jsForms/forms.  Inclusion was for use
 *   with future validation methods.
 **/

(function($){

	// Just create a simple forms object/namespace.
	window.forms = {};
	
	// Create a simple 'class' for our Form creator.
	window.forms.Form = function(){ this.init.apply(this, arguments)} ;
	
	window.forms.Form.prototype = {
		// A container array to hold all of the fields
		// keep them as individuals.		
		activeFields: [],
		
		// A string to hold all the fields lumped together.
		formHtml: '',
		
		/*** 
		 * forms.Form (init)
		 * a simple method called when a new Form object is created that sets
		 * a class variable to the fields requested.
		 * 
		 * @param object of fields with options
		 **/
		init:function(fields) 
		{
			this.__fields = fields;
		},

		/*** 
		 * forms.Form.build 
		 * Method to loop through the fields and actually create the html and store it
		 * to our local holding variables.
		 * 
		 * @param object initial
		 **/
		build: function()
		{		
			for(field in this.__fields)
			{
				this.activeFields.push(this.__fields[field]);
				this.formHtml += this.__fields[field] + "\n";
			}
				
			this.formHtml = this.formHtml.substring(0, (this.formHtml.length - 1));
		},

		/*** 
		 * forms.Form.buildDL
		 * Create a DL list based off of the form list provided and
		 * return the html that is created.
		 * 
		 * @param n/a
		 **/
		buildDL: function()
		{
			return this.buildWithTemplate({
				container: "<dl>%@</dl>",
				field: '<dt><label for="%@">%@</label></dt><dd>%@</dd>'
			});
		},
		
		/*** 
		 * forms.Form.buildP
		 * Create a P list based off of the form list provided and
		 * return the html that is created.
		 * 
		 * @param n/a
		 **/
		buildP: function(formId)
		{
			return this.buildWithTemplate({
				container: "<p>%@</p>",
				field: '<label for="%@">%@</label> %@'
			});
		},
		
		/***
		 * forms.Form.buildWithTemplate
		 * Create a form field layout using an html template
		 *
		 * @param tplObject - object with template setup for form field (container, field)
		 **/
		buildWithTemplate: function(tplObject)
		{
			var templateContent = '';
			
			for(field in this.__fields)
				templateContent += tplObject.field.$$(field, field.ucFirst(), this.__fields[field]);
				
			return tplObject.container.$$(templateContent);
		}
	}
	
	
	/*** 
	 * forms.Fields
	 * An object to hold all of the various form fields
	 * used to create the actual form elements
	 * 
	 * @param n/a
	 **/	
	window.forms.Fields = {

		/*** 
		 * forms.Fields.__input
		 * Handles creation of all input based form fields
		 * and returns created html
		 * 
		 * @param fieldType - (text, input, radio, etc)
		 * @param options   - Object to contain all the options used in the form
		 **/
		__input: function(fieldType, options)
		{
			return (function(fieldType, options){
				var field = '<input type="%@" name="%@" id="%@" class="%@ %@" value="%@" %@>'

				return field.$$(
						(typeof fieldType == 'undefined')? 'text' 	 : fieldType,
						(typeof options.name == 'undefined')? '' 	 : options.name,
						(typeof options.id == 'undefined')? '' 		 : options.id,
						(typeof options.classes == 'undefined')? ''  : options.classes,
						(typeof options.validate == 'undefined')? '' : options.validate,
						(typeof options.value == 'undefined')? '' 	 : options.value,
						(typeof options.disabled == 'undefined' || !options.disabled)? '' : 'disabled="disabled"'
					);
			})(fieldType, options);
		},
		
		/*** 
		 * forms.Fields.__select
		 * Handles creation of all select based form fields
		 * and returns created html
		 * 
		 * @param options   - Object to contain all the options used in the form
		 * @param multiple  - Option to determine if it is multiselect or standard
		 **/
		__select: function(options, multiple)
		{
			return (function(options, multiple){
				var selectHeader = (multiple) ? '<select %@ name="%@" id="%@" class="%@ %@">' : '<select %@ name="%@" id="%@" class="%@ %@">';
				var selectOptions = '';
				var selectFooter = '</select>';
				
				var type = (multiple)? 'multiple' : '';
				
				if(typeof options.options != 'undefined')
				{			
					for(option in options.options)
					{
						if(multiple && $.isArray(options.value))
							var selected = ($.inArray(options.options[option], options.value))? 'selected' : '';

						else if(!multiple && typeof options.value == 'string')
							var selected = (options.value == options.options[option])? 'selected' : '';
						else
							selected = '';
							
						selectOptions += '<option value="%@" %@ >%@</option>'.$$(option, selected, options.options[option]);
					}
				}
				
				selectHeader = selectHeader.$$(
						type,
						(typeof options.name == 'undefined')? '' 	 : options.name,
						(typeof options.id == 'undefined')? '' 		 : options.id,
						(typeof options.classes == 'undefined')? ''  : options.classes,
						(typeof options.validate == 'undefined')? '' : options.validate
					);
				
				return selectHeader + selectOptions + selectFooter;
			})(options, multiple);
		},
		
		/*** 
		 * forms.Fields.select
		 * Handles creation SELECT form field
		 * 
		 * @param options   - Object to contain all the options used in the form
		 **/
		select: function(options)
		{
			return this.__select(options, false)
		},
		
		/*** 
		 * forms.Fields.multiselect
		 * Handles creation SELECT form field with a multiselect option
		 * 
		 * @param options   - Object to contain all the options used in the form
		 **/
		multiselect: function(options)
		{
			return this.__select(options, true)			
		},
		
		/*** 
		 * forms.Fields.bool
		 * Handles creation SELECT based "yes" "no" field
		 * 
		 * @param options   - Object to contain all the options used in the form
		 **/
		bool: function(options)
		{
			var value = (
							options.value == 1 		|| 
							options.value == true	||
							options.value == 'yes'	||
							options.value == 'true'
						)? 'yes' : 'no';
						
			delete(options.value);
			options.value = value;
			
			options.options = {
				0:'no',
				1:'yes'
			}
			
			return this.__select(options);
		},
		
		/*** 
		 * forms.Fields.multiselect
		 * Handles creation of multiple checkboxes for field options
		 * 
		 * @param checkboxes - An array of checkbox method calls 
		 **/
		
		multicheck: function(checkboxes)
		{
			var template = '<label for="%@">%@</label>%@ &nbsp;';
			var checkboxCollection = '';
			
			for(checkbox in checkboxes)
				checkboxCollection += template.$$(	checkboxes[checkbox].name, 
													checkboxes[checkbox].label, 
													this.__input('checkbox', checkboxes[checkbox])
												);
			return checkboxCollection;
		},
		
		/*** 
		 * forms.Fields.checkbox
		 * Handles creation CHECKBOX form field
		 * 
		 * @param options   - Object to contain all the options used in the form
		 **/
		checkbox: function(options)
		{
			var field = this.__input('checkbox', options);
			return (options.checked) ? field.replace(/value=\"(.*)\"/, 'checked="checked"') : field = field.replace(/value=\"(.*)\"/, '');
		},
		
		/*** 
		 * forms.Fields.text
		 * Handles creation TEXT form field
		 * 
		 * @param options   - Object to contain all the options used in the form
		 **/
		text: function(options)
		{
			return this.__input('text', options)
		},
		
		/*** 
		 * forms.Fields.password
		 * Handles creation PASSWORD form field
		 *  
		 * @param options   - Object to contain all the options used in the form
		 **/
		password: function(options)
		{
			return this.__input('password', options)
		},
		
		textarea: function(options)
		{
			return (function(options){
				var field = '<textarea name="%@" id="%@" class="%@ %@" %@>%@</textarea>';

				return field.$$(
						(typeof options.name == 'undefined')? '' 	 : options.name,
						(typeof options.id == 'undefined')? '' 		 : options.id,
						(typeof options.classes == 'undefined')? ''  : options.classes,
						(typeof options.validate == 'undefined')? '' : options.validate,
						(typeof options.disabled == 'undefined' || !options.disabled)? '' : 'disabled="disabled"',
						(typeof options.value == 'undefined')? '' 	 : options.value
					);
			})(options);

		}
	}

	/***
	 * Javascript String Extensions
	 * Various extensions to the native javascript type String
	 **/
	
	
	/***
	 *	Extend String to add format ($$) function that will 
	 *	mimic C's sprintf function.  Replacing %@ character set
	 *	with param/values passed to the method.
	 **/
	String.prototype.format = String.prototype.$$ = function() 
	{
		var args = arguments;
		var idx = 0;

		return this.replace(/%@([0-9]+)?/g, function(s, argIndex) 
		{
			argIndex = (argIndex) ? parseInt(argIndex,0)-1 : idx++ ;
			s =args[argIndex];

			return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString();
		});
	};

	/***
	 *	Extend String to add words (w) method that will split
	 *	a space seperated string into an array.
	 **/
	String.prototype.words = String.prototype.w = function()
	{
		return this.split(' ');
	}

	/***
	 * Extend String to add method to uppercase the first letter
	 * of each word in a sentence.
	 **/
	String.prototype.ucFirst = function() 
	{
		var stringArray = this.w();
		var finalString = '';
		for(item in stringArray)
			finalString += stringArray[item].substring(0,1).toUpperCase() + stringArray[item].substring(1, stringArray[item].length) + ' ';

		return finalString.substring(0, (finalString.length -1));
	}

	/***
	 * Extend String to add method that will take a camelCase
	 * syntax and convert it into a space seperated 'sentence'
	 **/
	String.prototype.deCamel = function()
	{
		return this.replace(new RegExp("([A-Z])", "g"), " $1").toLowerCase();
	}
	

})(jQuery);

