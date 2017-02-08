

//Login button clicked run this function, ajax post to controllers.LaunchController.loginUser via routes
function btnLoginSubmit_click(){	
  var id = $('#login-id-input').val();
  var pwd = $('#login-pwd-input').val(); 
  if(id.length!=0 && pwd.length!=0){
	  var obj = new Object();
	  obj.type = "login";
	  obj.id = id;
	  obj.pwd = pwd;
	  
	  $.ajax({
	    type : 'POST',
	    crossOrigin: true,
	   
	    url : "/login",
	    data : obj,
	    success : function(e) {
	      $('#login-id-input').val("");
	      $('#login-pwd-input').val("");
	      if (e === "success") {
	        window.location.replace("/main"); // if login success, load main.scala.html (dashboard) check controller.PageController.main
	      } else {
	    	  alert("가입 된 정보가 없습니다.")
	      }
	    }
	  });
  }
  else{
	  alert("모든 값을 입력하세요.");
	  $('#loginfrm').submit();
  }
};


//Register button clicked run this function, ajax post to controllers.LaunchController.loginUser via routes
function btnRegisterSubmit_click(){
  var id = $('#signin-id-input').val();
  var email =$('#signin-email-input').val();
  var pwd = $('#signin-pwd-input').val();
  var repwd = $('#signin-repwd-input').val();

  if(id.length!=0 && email.length!=0 && pwd.length!=0 && repwd.length!=0){
	  ///Email format validation check by regular expression
	  var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;  
	  if (regex.test($('#signin-email-input').val()) === false) {
	  	alert("유효하지 않은 E-mail입니다. 다시 입력하세요.");
	    $('#signin-email-input').val("");
	  }
	  else
	  {		  
		  if(pwd != repwd){
			  alert("정확히 다시 입력하세요.");
			  $('#signin-repwd-input').val("");
		  }
		  else{
			  var obj = new Object();
			  obj.type = "signin";
			  obj.id = id;
			  obj.email=email;
			  obj.pwd = pwd;
			  var jsonString = JSON.stringify(obj);
			  $.ajax({
			    type : 'POST',
			    crossOrigin: true,
			    url : "/login",
			    data : obj,
			    success : function(e) {
			      $('#signin-id-input').val("");
			      $('#signin-email-input').val("");
			      $('#signin-pwd-input').val("");
			      $('#signin-repwd-input').val("");
			      window.location.replace("/main"); // if register success, load main.scala.html (dashboard) check controller.PageController.main
			    }
			    });
		  }
	  }  
  }
  else{
	  alert("모든 값을 입력하세요.")
	  $('#registerfrm').submit();
  }    
};
$(document).ready(function(){
	
/////When user input uId to '#signin-id-input' element(in login.scala.html) ,  ajax post to controllers.LaunchController.idDupCheck via routes
  $('#signin-id-input').focusout(function() {
    var signin_id_Value = $('#signin-id-input').val();
    $.ajax({
      type : 'POST',
      crossOrigin: true,
      url : "/iddupcheck",
      data : {
        "id" : signin_id_Value
      },
      success : function(e) {
        if (e === "0" ) {

        } else {
        	alert("사용할 수 없는 ID 입니다. 다시 입력하세요.");
          $('#singin-id-input').val("");
        }
      }
    });
  });
})
