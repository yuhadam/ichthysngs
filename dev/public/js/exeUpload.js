/**
 * 
 */

var exeList = function(){
  $.ajax({
    url:'/views/exeList',
    type:'GET',
    success: function(data) {
      $("#exelist").html(data);    
    }
 });
  $('#exeName').focusout(function() {
	    var exeName = $('#exeName').val();
	    if(exeName.length <= 1){
	    	alert("exe name should two or more word")
	    	$("#exeName").val("")
	    }
	    else{
	    	$.ajax({
	    	crossOrigin: true,    
	      	type: 'POST' ,
	      	url: "/exedupcheck" ,
	      	data: {"exeName" : exeName} ,
	      	success: function(e) {          
	    	  if(e === "0") {
	        	} else {
	        	alert("duplicated exe name");
	          	$("#exeName").val("")
	        	}
	      	}               
	    	});
	    }
	  });
  $('#upload-exeButton').click(function(){
	   	var filename=$("#exe").val().replace(/C:\\fakepath\\/i, '')
	  	exeSizeObj[filename]=document.getElementById("exe").files[0].size;
	    exeConf.fileName=filename;
	    exeConf.type="Exe Upload"
	    exeConf.uId=conf.uId;
	    exeConf.exeName=$("#exeName").val();
		exeConf.description=$("#exeDescription").val();
		var formData = new FormData($("#exeForm")[0]);
		var sizeObj=exeSizeObj;
		var obj=exeConf;
		
		if(eCheck==0){
			var env= exeConf.exeName.toUpperCase();
			
			if(exeConf.listNum<10){
				var td = "<td>"+filename+"</td><td>"+exeConf.description+"</td><td>"+exeConf.uId+"</td><td>/nfsdir/"+exeConf.uId+"/"+filename+"</td><td>$"+env+"</td>"
				$("#exe-list-table #"+exeConf.listNum).html(td);
				exeConf.listNum+=1;
			}
			else{
				$("#exe-list-table").append("<tr id='"+exeConf.listNum+"'><td>"+filename+"</td><td>"+exeConf.description+"</td><td>"+exeConf.uId+"</td><td>/nfsdir/"+exeConf.uId+"/"+filename+"</td><td>$"+env+"</td></tr>")
				exeConf.listNum+=1;
			}
		}
		
		if($("#exeName").val().length!=0){			
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
			alert("Insert Exe Name!");
		}
//		exeConf=new Object();
		exeSizeObj= new Object();
	  });
}
/**
 * 
 */