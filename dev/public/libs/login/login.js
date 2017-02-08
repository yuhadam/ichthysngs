var setWindowSize = function(windowSizeArray) {

  $('.container').css({
  "width" : windowSizeArray[0],
  "height" : windowSizeArray[1]
  });
};

var getWindowSize = function() {
  var height = window.innerHeight;
  var width = window.innerWidth;

  return [ width, height ];
};

$(function() {
  setWindowSize(getWindowSize());
});

var resizeFunction = function() {

  $(window).resize(function() {
    setWindowSize(getWindowSize());
  });
};

var placeHolder = function() {

  $(".holder + input").keyup(function() {
    if ($(this).val().length) {
      $(this).prev('.holder').hide();
    } else {
      $(this).prev('.holder').show();
    }
  });
  $(".holder").click(function() {
    $(this).next().focus();
  });
};

var loginValidation = function() {
  $('#login-button').click(function() {
    var flagNum = 0;

    var id = $('#login-id-input').val();
//    var email =$('#login-email-input').val();
    var pwd = $('#login-pwd-input').val();

    if (id.length === 0) {
      $('#login-id-vali').html("id 입력하세요");
      flagNum++;
    } 
//    else {
//      var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
//      if (regex.test(email) === false) {
//        $('#login-email-vali').html("email을 다시 입력하세요");
//        flagNum++;
//      }
//    }

    if (pwd.length === 0) {
      $('#login-pwd-vali').html("비밀번호를 입력하세요");
      flagNum++;
    } else {
    }

    if (flagNum === 0) {
      var obj = new Object();
      obj.type = "login";
      obj.id = id;
      obj.pwd = pwd;
      // var jsonString = JSON.stringify(obj);

      $.ajax({
      type : 'POST',
      crossOrigin: true,
     
      url : "/login",
      data : obj,
      success : function(e) {
        $('#login-id-input').val("");
        $('#login-pwd-input').val("");
        if (e === "success") {
          window.location.replace("/main");
        } else {
          $('#login-id-vali').html(e);
        }
      }
      });
    } else {
    }
  });

};

var signinValidation = function() {

  var idValidation = 0;

  $('#signin-id-input').focusout(function() {

    idValidation = 0;

    var signin_id_Value = $('#signin-id-input').val();
    if(signin_id_Value.length==0){
      $('#signin-id-vali').html("insert ID");
    }
    else{
    $.ajax({
    type : 'POST',
    crossOrigin: true,
   
    url : "/iddupcheck",
    data : {
      "id" : signin_id_Value
    },
    success : function(e) {

      if (e === "0") {
        $('#signin-id-vali').html("you can use");

      } else {
        $('#signin-id-vali').html("duplicated id");
        idValidation = 1;

      }

    }
    });
    }
  });

  $('#signin-button').click(function() {
    var flagVal = 0;

    var id = $('#signin-id-input').val();
    var email =$('#signin-email-input').val();
    var pwd = $('#signin-pwd-input').val();
    var repwd = $('#signin-repwd-input').val();

    if (id.length === 0) {
      $('#signin-id-vali').html("id을 입력하세요");
      flagVal++;
    } 
    if(email.length===0){
      $('#signin-email-vali').html("email을 입력하세요");
      flagVal++;
    }
    else {
      var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
      if (regex.test(id) === false) {
        $('#signin-email-vali').html("email을 다시 입력하세요");
        flagVal++;
      }
    }

    if (pwd.length === 0) {
      $('#signin-pwd-vali').html("비밀번호를 입력하세요");
      flagVal++;
    } else {
    }

    if (repwd.length === 0) {
      $('#signin-repwd-vali').html("위에서 설정한 비밀번호를 입력하세요");
      flagVal++;
    } else {
    }

    if (pwd !== repwd) {
      $('#signin-repwd-vali').html("위에서 설정한 비밀번호와 다릅니다");
      flagVal++;
    }
    if (flagVal === 0 && idValidation === 0) {
      alert("good");
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
        window.location.replace("/main");
      }
      });

    } else {

      alert("no");
    }
  });

};

$(document).ready(signinValidation);
$(document).ready(loginValidation);
$(document).ready(placeHolder);
$(document).ready(resizeFunction);
/*
 * $(function() { $('#login-id-input').val(" "); $('#login-pwd-input').val("");
 * 
 * });
 */
