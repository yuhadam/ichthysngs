/**
 * 
 */
var cnt =0;
var addBtn;
var empty;
function getBaseImageTable(count){
	
  if(count==0){
	  $("#baseImagePrevious").hide();
  }
  else{
	  $("#baseImagePrevious").show();
  } 
  
  var arr = [];
  $.ajax({
    type: 'GET' ,
    url: "/getBaseImageTable/"+count ,
    crossOrigin: true,
    success: function(e) {
      var a1 = JSON.parse(e);
      var x;
      for( x in a1) {
        var baseImageobject = new Object();
        baseImageobject.baseImageName = a1[x].imgName;
        baseImageobject.osType=a1[x].osType;
        baseImageobject.dockerFile = a1[x].dockerFile;
        baseImageobject.description = a1[x].description;
        baseImageobject.uId = a1[x].uId;
        if(mCheck==1){
        	if(dockerFileConf.from==a1[x].imgName){
        		baseImageobject.add = "<td><input type='checkbox' id='addBtn' name='check[]' checked='checked' /> <span class='badge' > check</span></td>";
        	}
        	else{
        		baseImageobject.add = "<td><input type='checkbox' name='check[]' id='addBtn' /> <span class='badge' > check</span></td>";
        	}
        }
        else{
        	baseImageobject.add=""
        }
        arr.push(baseImageobject);
      }             
      for(y in arr) {
    	 $("#baseimage-list-table").append("<tr id='"+y+"' name='"+arr[y].baseImageName+"' value='"+arr[y].dockerFile+"' data-toggle='collapse' data-target='#acc_"+arr[y].baseImageName+"' class='accordion-toggle' ><td>"+arr[y].baseImageName+"</td><td>"+arr[y].osType+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td>"+arr[y].add+"</tr>");
    	 $('#baseimage-list-table').append("<tr name='dockerFile' ><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+y+"' id='acc_"+arr[y].baseImageName+"' class='accodian-body collapse' class='padding' ><h3>DockerFile</h3><p>"+arr[y].dockerFile+"</p></div></div></div></td></tr>");
    	 baseImageConf.listNum=arr.length;
      }
      if(arr.length<10){
    	   for(var i = arr.length; i<10; i++){
    		   $("#baseimage-list-table").append("<tr id='"+i+"' data-toggle='collapse'  class='accordion-toggle' ><td>&nbsp</td><td></td><td></td><td></td>"+empty+"</tr>");    		   
    		   $('#baseimage-list-table').append("<tr name='dockerFile'><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+i+"' class='accodian-body collapse' class='padding'><h3>DockerFile</h3><p id='dockerfile'></p></div></div></div></td></tr>");
    	   }
      }
    }               
  });
  	
}
function getBaseImageSearchTable(flag,value,osType){
	iCheck=1;
	$("#baseImagePrevious").hide();
	$("#baseImageNext").hide();
	var arr = [];
		$.ajax({
			type: 'GET' ,
		    url: "/getBaseImageSearchTable?flag="+flag+"&value="+value+"&osType="+osType ,
		    crossOrigin: true,
		    success:function(e){
		    	var a1 = JSON.parse(e);
		        var x;
		        for( x in a1) {
		          var baseImageobject = new Object();
		          baseImageobject.baseImageName = a1[x].imgName;
		          baseImageobject.osType=a1[x].osType;
		          baseImageobject.dockerFile = a1[x].dockerFile;
		          baseImageobject.description = a1[x].description;
		          baseImageobject.uId = a1[x].uId;
		          if(mCheck==1){
		        	  if(scripts.hasOwnProperty(a1[x].imgName)){
		          		baseImageobject.add = "<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";
		          	}
		          	else{
		          		baseImageobject.add = "<td><input type='checkbox' id='addBtn' /> <span class='badge' > check</span></td>";
		          	}
		          }
		          else{
		        	  baseImageobject.add=""
		          }
		          arr.push(baseImageobject);
		        } 
		        var y=0;
		        for(y in arr) {
		        	$("#baseimage-list-table").append("<tr id='"+y+"' name='"+arr[y].baseImageName+"' value='"+arr[y].script+"' data-toggle='collapse' data-target='#acc"+arr[y].baseImageName+"' class='accordion-toggle' ><td>"+arr[y].baseImageName+"</td><td>"+arr[y].osType+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td>"+arr[y].add+"</tr>");		        	
		        	$('#baseimage-list-table').append("<tr name='script' value='"+arr[y].dockerFile+"'><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+y+"' id='acc"+arr[y].baseImageName+"' class='accodian-body collapse' class='padding'><h3>DockerFile</h3><p>"+arr[y].dockerFile+"</p></div></div></div></td></tr>");
		     	}
		        if(y<10){
		        	 for(var i = y; i<10; i++){
		        		 $("#baseimage-list-table").append("<tr id='"+i+"' data-toggle='collapse'  class='accordion-toggle' ><td>&nbsp</td><td></td><td></td><td></td>"+empty+"</tr>");
		      		   $('#baseimage-list-table').append("<tr name='script'><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+i+"' class='accodian-body collapse' class='padding'><h3>DockerFile</h3><p id='dockerfile'></p></div></div></div></td></tr>");		        	    	   
		      	   }
		        }
		    }
		})
}

$(document).ready(function(){
	baseImageConf.listNum=0;
	cnt=0;
	getBaseImageTable(cnt);	  
	
	 if(mCheck==1 ){
////		  addBtn="<td><a class='btn btn-green-3' id='addBtn'> Select </a></td>";
//		  addBtn="<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";		  
		  empty="<td></td>";
		  $("#imageHead").append("<th>ADD</th>");
	  }
	  else{
//		  addBtn="";
		  empty="";	  
	  }
	
	$("#baseImagePrevious").click(function(){		
		cnt-=10;
		$('#baseimage-list-table').empty();
		getBaseImageTable(cnt)
	})
	$("#baseImageNext").click(function(){
		cnt+=10;
		$('#baseimage-list-table').empty();
		getBaseImageTable(cnt)
	})
	
	$("#baseImageSearchBtn").click(function(){
		var osTypeSelect=$("#osTypeSelect").val();
		var searchSelect= $("#baseImageSearchSelect").val();
		var inp= $("#baseImageSearchInp").val();
		cnt=0;
		if(searchSelect=="ImageName"){
			$("#baseimage-list-table").empty();
			getBaseImageSearchTable(1,inp,osTypeSelect)
		}
		else if(searchSelect=="DockerFile"){
			$("#baseimage-list-table").empty();
			getBaseImageSearchTable(2,inp,osTypeSelect)
		}
		else if(searchSelect=="Description"){
			$("#baseimage-list-table").empty();
			getBaseImageSearchTable(3,inp,osTypeSelect)
		}		
		else{
			$("#baseimage-list-table").empty();
			getBaseImageSearchTable(4,inp,osTypeSelect)
		}		
	})
	$("#initBaseImageList").click(function(){
		iCheck=0;
		cnt=0;
		$("#baseimage-list-table").empty();
		getBaseImageTable(cnt);
		$("#baseImageNext").show();
	})
	
	
});
