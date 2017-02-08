package controllers

import javax.inject._
import akka.actor._
import play.api.Logger
import models.UserModel
import play.libs.Json

object WebSocketActor {
  val system = ActorSystem("helloSystem")
  val room = system.actorOf(Props[Room],name = "hi")
  
  def getRoomRef = room
  
  def props(out: ActorRef) = {Logger.debug("out");Props(new WebSocketActor(out,room))}
  
  def sendMessage(str: String,uId:String) = {
    Logger.debug("socket")
    room ! Message(str,uId)
  }
  
}

class WebSocketActor(out: ActorRef, room: ActorRef) extends Actor {
  def receive = {
    case uId: String => {
      Logger.debug(uId)
      room ! Connected(out, uId)
    }
  }
}

class Room @Inject() extends Actor {
  var members = Map.empty[String, ActorRef]
  
  def receive = {
    case Connected(actorRef,uId) => {
      Logger.debug(uId)
      members = members + (uId -> actorRef)
     
    }
    
    case Message(message,uId) => {
      members.get(uId).get ! message
    }
  }
}


case class Connected(ar : ActorRef,uId : String)
case class Message(message : String, uId :String)
