package models

import javax.inject.Inject
import play.api.db.slick.DatabaseConfigProvider
import slick.dbio
import slick.dbio.Effect.Read
import slick.driver.JdbcProfile
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.Logger
import play.api.cache._
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import slick.lifted._


case class User(uIndex:Int,uId:String,uEmail:String, password:String)


class UserModel @Inject()(protected val dbConfigProvider: DatabaseConfigProvider){
  
  val dbConfig = dbConfigProvider.get[JdbcProfile]
  val db = dbConfig.db
  
  import dbConfig.driver.api._
  

  
    
  class UserTable(tag: Tag) extends Table[User](tag, "USER") {

    def uIndex = column[Int]("uIndex", O.AutoInc, O.PrimaryKey)
    
    def uId = column[String]("uId")
    def uEmail=column[String]("uEmail")
    def password = column[String]("password")    

    def * = (uIndex, uId,uEmail, password) <> (User.tupled, User.unapply)
  }
    val Users = TableQuery[UserTable]
  
    def insert(userData:User)=db.run(DBIO.seq( Users += userData ))

    def delete(uId: String)= db.run(Users.filter{_.uId === uId}.delete)
    
    def retrieve(userData: User, flag:Int):Seq[User]= {
      if(flag==1){
        val dbRetrieve = db.run(compiledCheck(userData.uId,userData.password).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
      }
      else if(flag==2){
        val dbRetrieve =db.run(compiledCheckById(userData.uId).result) 
        val result = Await.result(dbRetrieve, Duration.Inf)
        return result
        
      }
      else return null
    }
//     def iddupcheck(id: String ) = {
//      val dbRetrieve =db.run(compiledCheckById(id).result) 
//      val result = Await.result(dbRetrieve, Duration.Inf)
//      result.length
//    }
    def update(userData: User)={

    }
    
    def check(uId:Rep[String], password:Rep[String]) = Users.filter{user => user.uId === uId && user.password === password}
    def compiledCheck = Compiled(check _)
    
    def checkById(id:Rep[String]) = Users.filter {user => user.uId === id}
    def compiledCheckById = Compiled(checkById _)
    
   
    
    
    
    
  
}