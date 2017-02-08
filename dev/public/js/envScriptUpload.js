/**
 * 
 */

var envScriptList = function(){
  $.ajax({
    url:'/views/envScriptList',
    type:'GET',
    success: function(data) {
      $("#envscriptlist").html(data);    
    }
 });
  $('#scriptName').focusout(function() {
	    var scriptName = $('#scriptName').val();
	    var osType=$('#osType').val();
	    if(scriptName.length <= 1){
	    	alert("Script name should two or more word")
	    	$("#scriptName").val("")
	    }
	    else{
	    	$.ajax({
	    	crossOrigin: true,    
	      	type: 'POST' ,
	      	url: "/scriptdupcheck" ,
	      	data: {"scriptName" : scriptName,"osType":osType} ,
	      	success: function(e) {          
	    	  if(e === "0") {
	    	  }else {
	        	alert("duplicated script name");
	          	$("#scriptName").val("")
	        	}
	      	}               
	    	});
	    }
	  });
  $('#store-button').click(function(){
	  	scriptConf.uId=conf.uId;
	  	scriptConf.scriptName=$("#scriptName").val();
	  	scriptConf.osType=$("#osType").val();
	  	scriptConf.script=$("#script").val();
	  	scriptConf.description=$("#des").val();
		if(sCheck==0){
			if(scriptConf.listNum<10){
				var td = "<td>"+scriptConf.scriptName+"</td><td>"+scriptConf.osType+"</td><td>"+scriptConf.description+"</td><td>"+scriptConf.uId+"</td>"
				$("#script-list-table #"+scriptConf.listNum).attr("data-target","#acc"+scriptConf.scriptName)
				$("div[name=acc"+scriptConf.listNum+"]").attr("id","acc"+scriptConf.scriptName);
				$("div[name=acc"+scriptConf.listNum+"] p[name='script']").append(scriptConf.script)
				$("#script-list-table #"+scriptConf.listNum).html(td);
				scriptConf.listNum+=1;
				
			}
			else{
				$("#script-list-table").append("<tr id='"+scriptConf.listNum+"' name='"+scriptConf.scriptName+"' data-toggle='collapse' data-target='#acc"+scriptConf.scriptName+"' class='accordion-toggle' ><td>"+scriptConf.scriptName+"</td><td>"+scriptConf.osType+"</td><td>"+scriptConf.description+"</td><td>"+scriptConf.uId+"</td></tr>")
				$("#script-list-table").append("<tr name='script' value='"+scriptConf.script+"'><td colspan='4' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+baseImageConf.listNum+"' id='acc"+baseImageConf.imgName+"' class='accodian-body collapse' class='padding'><h3>Shell Script</h3><p>"+scriptConf.script+"</p></div></div></div></td></tr>")
				scriptConf.listNum+=1;
			}
		}
		$.ajax({
		    crossOrigin: true,     
		    url: "/scriptupload"+"?conf="+JSON.stringify(scriptConf),
		    type: "POST",
		    processData: false,
		    contentType:false,
		    success : function(data) {
		    	alert("success!")
		    	$("#scriptName").val("")
		    	$("#script").val("")
		    	$("#des").val("")
		    },
		    error : function(err) {
		    }    
		});
  });
//  baseImageConf=new Object();
}
