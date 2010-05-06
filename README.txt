jsforms v0.3 beta
-----------------------------------------------------------------
jsforms allows the creation of forms in pure javascript.
-----------------------------------------------------------------
All examples below assume you are including jQuery

Usage:
1. Create a new form instance:
---
	var myForm = new forms.Form({
		username: forms.Fields.text({
			id:'id_username',
			name: 'username',
			value: 'enter a username'
		}),
	
		password: forms.Fields.password({
			id: 'id_password',
			name: 'password',
		})
	})

Note: the object key will be used for your label

2. To render your form, you have several options:
	- buildDL: will build a <dl> base list where labels are in the dt tag and fields are in a dd tag
	- buildP: will build a <p> for each label and field with a &nbsp; seperating
	- buildFromTemplate: will allow you to specify a template used to render your form
	
   In your current html:
		<form id="myForm">
			<p><button type="submit">Submit</button</p>
		</form>
	
	On your document on load:
		$(function(){
			$('#myForm').prepend(myForm.buildDL());
		})
		
	To use buildWithTemplate:
		positions are in order of: 
			container: tags to wrap your field in. %@ in container represents were your field will be included.
			field: tags to place your label and field in.  %@ order is: field name, label text (object key), field name, field.
			
		var template = 	{
				container: "<table>%@</table>",
				field: '<tr><td><label for="%@">%@</label></td><td> %@ </td></tr>'
			}
			
		$('#myForm').prepend(myForm.buildWithTemplate(template));
	