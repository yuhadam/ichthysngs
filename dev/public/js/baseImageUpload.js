/**
 * 
 */

var baseImageList = function(){
  $.ajax({
    url:'/views/baseImageList',
    type:'GET',
    success: function(data) {
      $("#baseImagelist").html(data);    
    }
 });
  $('#baseImageName').focusout(function() {
	    var baseImageName = $('#baseImageName').val();
	    if(baseImageName.length <= 1){
	    	alert("baseImage name should two or more word")
	    	$("#baseImageName").val("")
	    }
	    else{
	    	$.ajax({
	    	crossOrigin: true,    
	      	type: 'POST' ,
	      	url: "/baseImagedupcheck" ,
	      	data: {"imgName" : baseImageName} ,
	      	success: function(e) {          
	    	  if(e === "0") {
	    	  }else {
	        	alert("duplicated baseImage name");
	          	$("#baseImageName").val("")
	        	}
	      	}               
	    	});
	    }
	  });
  $('#store-button').click(function(){
	  	baseImageConf.uId=conf.uId;
	  	baseImageConf.imgName=$("#baseImageName").val();
	  	baseImageConf.script=$("#script").val();
		baseImageConf.description=$("#des").val();
		
		if(iCheck==0){
			if(baseImageConf.listNum<10){
				var td = "<td>"+baseImageConf.imgName+"</td><td>"+baseImageConf.description+"</td><td>"+baseImageConf.uId+"</td>"
				$("#baseimage-list-table #"+baseImageConf.listNum).attr("data-target","#acc"+baseImageConf.imgName)
				$("div[name=acc"+baseImageConf.listNum+"]").attr("id","acc"+baseImageConf.imgName);
				$("#baseimage-list-table #"+baseImageConf.listNum).html(td);
				baseImageConf.listNum+=1;
				
			}
			else{
				$("#baseimage-list-table").append("<tr id='"+baseImageConf.listNum+"' name='"+baseImageConf.imgName+"' data-toggle='collapse' data-target='#acc"+baseImageConf.imgName+"' class='accordion-toggle' ><td>"+baseImageConf.imgName+"</td><td>"+baseImageConf.description+"</td><td>"+baseImageConf.uId+"</td></tr>")
				$("#baseimage-list-table").append("<tr name='script' value='"+baseImageConf.script+"'><td colspan='3' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+baseImageConf.listNum+"' id='acc"+baseImageConf.imgName+"' class='accodian-body collapse' class='padding'><h3>Shell Script</h3><p>"+baseImageConf.script+"</p></div></div></div></td></tr>")
				baseImageConf.listNum+=1;
			}
		}
		$.ajax({
		    crossOrigin: true,     
		    url: "/baseImageupload"+"?conf="+JSON.stringify(baseImageConf),
		    type: "POST",
		    processData: false,
		    contentType:false,
		    success : function(data) {
		    	alert("success!")
		    	$("#baseImageName").val("")
		    	$("#script").val("")
		    	$("#des").val("")
		    },
		    error : function(err) {
		    }    
		});
  });

}
