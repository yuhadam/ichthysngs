/**
 * 
 */

var bundleList = function(){
  $.ajax({
    url:'/views/bundleList',
    type:'GET',
    success: function(data) {
      $("#bundlelist").html(data);    
    }
 });
  $('#bundleName').focusout(function() {
	    var bundleName = $('#bundleName').val();
	    if(bundleName.length <= 1){
	    	alert("bundle name should two or more word")
	    	$("#bundleName").val("")
	    }
	    else{
	    	$.ajax({
	    	crossOrigin: true,    
	      	type: 'POST' ,
	      	url: "/bundledupcheck" ,
	      	data: {"bundleName" : bundleName} ,
	      	success: function(e) {          
	    	  if(e === "0") {
	    	  }else {
	        	alert("duplicated bundle name");
	          	$("#bundleName").val("")
	        	}
	      	}               
	    	});
	    }
	  });
  $('#upload-button').click(function(){
	   var filename=$("#bundle").val().replace(/C:\\fakepath\\/i, '');
	  	bundleSizeObj[filename]=document.getElementById("bundle").files[0].size;
	    bundleConf.type="Bundle Upload";
	    bundleConf.fileName=filename;
	    bundleConf.uId=conf.uId;
	  	bundleConf.bundleName=$("#bundleName").val();
		bundleConf.description=$("#bundleDescription").val();
		var formData = new FormData($("#bundleForm")[0]);
		var sizeObj=bundleSizeObj;
		var obj=bundleConf;
		if(bCheck==0){
			var env= bundleConf.bundleName.toUpperCase();			
			if(bundleConf.listNum<10){
				var td = "<td>"+bundleConf.bundleName+"</td><td>"+bundleConf.description+"</td><td>"+bundleConf.uId+"</td><td>/nfsdir/"+bundleConf.uId+"/"+bundleConf.bundleName+"</td><td>$"+env+"</td>"
				$("#bundle-list-table #"+bundleConf.listNum).html(td);
				bundleConf.listNum+=1;
			}
			else{
				$("#bundle-list-table").append("<tr id='"+bundleConf.listNum+"'><td>"+bundleConf.bundleName+"</td><td>"+bundleConf.description+"</td><td>"+bundleConf.uId+"</td><td>/nfsdir/"+bundleConf.uId+"/"+bundleConf.bundleName+"</td><td>$"+env+"</td></tr>")
				bundleConf.listNum+=1;
			}
		}
		
		if($("#bundleName").val().length!=0){
			if(uploadWin==null){
				uploadWin = window.open("views/uploadWindow","");				
				uploadWin.onload= function(){				
					uploadWin.receiveFromParent(formData,sizeObj,obj,null);
		    	}
			}
			else{
				uploadWin.focus();
				alert("Check upload window!")
				uploadWin.receiveFromParent(formData,sizeObj,obj,null);				
			}
			
		}
		else{
			alert("Insert Bundle Name!");
		}
//		bundleConf=new Object();
		bundleSizeObj=new Object();
	  });
}
