/**
 * 
 */

//set uploadPage tab 
$(document).ready(function(){
	contentChange("scriptUpload")
	contentChange("bundleUpload")
	contentChange("exeUpload")
	
	$('#uploadTab a').click(function(e){
		e.preventDefault()
		$(this).tab('show')
	})
	$('#uploadTab a:first').tab('show')
})

