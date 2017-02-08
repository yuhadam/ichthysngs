/**
 * 
 */
var cnt =0;
var empty;
function getExeTable(count){
//
  if(count==0){
	$("#exePrevious").hide();
  }
  else{
	$("#exePrevious").show();
  }
  var arr = [];
  $.ajax({
    type: 'GET' ,
    url: "/getExeTable/"+count ,
    crossOrigin: true,
    success: function(e) {
      var a1 = JSON.parse(e);
      var x;
      for( x in a1) {
        var exeobject = new Object();
        exeobject.exeName = a1[x].exeName;
        exeobject.description = a1[x].description;
        exeobject.uId = a1[x].uId;
        exeobject.location =a1[x].location;
        exeobject.envName=a1[x].envName;
        if(mCheck==1){
        	if(envs.hasOwnProperty(a1[x].exeName)){
        		exeobject.add = "<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";
        	}
        	else{
        		exeobject.add = "<td><input type='checkbox' id='addBtn' /> <span class='badge' > check</span></td>";
        	}
        }
        else{
        	exeobject.add=""
        }
        arr.push(exeobject);
      }       
      for(y in arr) {
    	  
    	  $("#exe-list-table").append("<tr id='"+y+"' name='"+arr[y].exeName+"' value='"+arr[y].envName+"'><td>"+arr[y].exeName+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td><td>"+arr[y].location+"</td><td>$"+arr[y].envName+"</td>"+arr[y].add+"</tr>")
    	  exeConf.listNum=arr.length;
      }
      if(arr.length<10){
    	   for(var i = arr.length; i<10; i++){
    		   $("#exe-list-table").append("<tr id='"+i+"'><td>&nbsp</td><td></td><td></td><td></td><td></td>"+empty+"</tr>");
    	   }
      }
    }               
  }); 
}
function getExeSearchTable(flag,value){
	sCheck=1;
	$("#exePrevious").hide();
	$("#exeNext").hide();
	var arr = [];
		$.ajax({
			type: 'GET' ,
		    url: "/getExeSearchTable?flag="+flag+"&value="+value ,
		    crossOrigin: true,
		    success:function(e){
		    	var a1 = JSON.parse(e);
		        var x;
		        for( x in a1) {
		          var exeobject = new Object();
		          exeobject.exeName = a1[x].exeName;
		          exeobject.description = a1[x].description;
		          exeobject.uId = a1[x].uId;
		          exeobject.location =a1[x].location;
		          exeobject.envName=a1[x].envName;
		          if(mCheck==1){
		        	  if(envs.hasOwnProperty(a1[x].exeName)){
		          		 exeobject.add = "<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";
		        	  }
		        	  else{
		        		 exeobject.add = "<td><input type='checkbox' id='addBtn' /> <span class='badge' > check</span></td>";
		        	  }		        	
		          }
		          else{
		        	  exeobject.add=""
		          }
		          arr.push(exeobject);
		        } 
		        var y=0;
		        for(y in arr) {
		        	
		        	$("#exe-list-table").append("<tr id='"+y+"' name='"+arr[y].exeName+"' value='"+arr[y].envName+"'><td>"+arr[y].exeName+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td><td>"+arr[y].location+"</td><td>$"+arr[y].envName+"</td>"+arr[y].add+"</tr>")
		     	}
		        if(y<10){
		        	 for(var i = y; i<10; i++){
		        		 $("#exe-list-table").append("<tr id='"+i+"'><td>&nbsp</td><td></td><td></td><td></td><td></td>"+empty+"</tr>");		        	    	   
		      	   }
		        }
		    }
		})
}
$(document).ready(function(){
	exeConf.listNum=0;
	cnt=0;
	getExeTable(cnt);

	if(mCheck==1){
		  empty="<td></td>";
		  $("#exeHead").append("<th>ADD</th>");
	  }
	  else{
		  empty="";
	  }
	
	
	$("#exePrevious").click(function(){		
		cnt-=10;
		$('#exe-list-table').empty();
		getExeTable(cnt)
	})
	$("#exeNext").click(function(){
		cnt+=10;
		$('#exe-list-table').empty();
		getExeTable(cnt)
	})
	
	$("#exeSearchBtn").click(function(){
		var searchSelect= $("#exeSearchSelect").val();
		var inp= $("#exeSearchInp").val();
		cnt=0;
		if(searchSelect=="exeName"){
			$("#exe-list-table").empty();
			getExeSearchTable(1,inp)
		}
		else if(searchSelect=="description"){
			$("#exe-list-table").empty();
			getExeSearchTable(2,inp)
		}
		else{
			$("#exe-list-table").empty();
			getExeSearchTable(3,inp)
		}		
	})
	$("#initExeList").click(function(){
		eCheck=0;
		cnt=0;
		$("#exe-list-table").empty();
		getExeTable(cnt);
		$("#exeNext").show();
	})
});
