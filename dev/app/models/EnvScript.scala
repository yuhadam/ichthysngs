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


case class EnvScript(scriptName:String, osType:String, script:String,description:String, uId:String)


class EnvScriptModel @Inject()(protected val dbConfigProvider: DatabaseConfigProvider){
  
  val dbConfig = dbConfigProvider.get[JdbcProfile]
  val db = dbConfig.db
  
  import dbConfig.driver.api._
  

  
    
  class EnvScriptTable(tag: Tag) extends Table[EnvScript](tag, "ENVSCRIPT") {

    def scriptName = column[String]("scriptName",O.PrimaryKey)
    def osType = column[String]("osType")
    def script = column[String]("script")
    def description=column[String]("description")
    def uId = column[String]("uId")    

    def * = (scriptName, osType, script,description, uId) <> (EnvScript.tupled, EnvScript.unapply)
  }
    val EnvScripts = TableQuery[EnvScriptTable]
  
    def insert(baseImageData:EnvScript)=db.run(DBIO.seq( EnvScripts += baseImageData ))

    def delete(scriptName: String)= db.run(EnvScripts.filter{_.scriptName === scriptName}.delete)
    
    def retrieve(data: String, flag:Int, osType:String):Seq[EnvScript]= {
      if(flag>=10 || flag==0){
        val dbRetrieve = db.run(compiledEnvScript(flag,flag+10).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if (flag==1){
        val dbRetrieve = db.run(compiledCheckByEnvScriptName("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if(flag==2){
        val dbRetrieve = db.run(compiledCheckByEnvScript("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if(flag==3){
        val dbRetrieve = db.run(compiledCheckByEnvScriptDescription("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if (flag==4){
        val dbRetrieve = db.run(compiledCheckById("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
  
      else {
        val dbRetrieve = db.run(compiledCheckByEnvScriptDupName(data).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
      }
    }

    def envScriptCheck(limit:ConstColumn[Long], max:ConstColumn[Long]) =  EnvScripts.sortBy(_.uId).sortBy(_.scriptName).drop(limit).take((max)).sortBy (_.osType.desc) 
    def compiledEnvScript = Compiled(envScriptCheck _)
    
//    def checkByEnvScriptName(scriptName:Rep[String],osType:Rep[String]) = EnvScripts.filter{ script => script.scriptName like scriptName}.sortBy { _.scriptName.asc } 
    def checkByEnvScriptName(scriptName:Rep[String],osType:Rep[String]) = EnvScripts.filter { script => script.osType === osType }.filter{ script => script.scriptName like scriptName}.sortBy(_.uId).sortBy { _.scriptName.asc }
    def compiledCheckByEnvScriptName = Compiled(checkByEnvScriptName _)
    
    def checkByEnvScriptDescription(description:Rep[String],osType:Rep[String]) = EnvScripts.filter { script => script.osType === osType }.filter{ script => script.description like description }.sortBy(_.uId).sortBy { _.scriptName.asc } 
    def compiledCheckByEnvScriptDescription = Compiled(checkByEnvScriptDescription _)

    def checkByEnvScript(envScript:Rep[String],osType:Rep[String]) = EnvScripts.filter { script => script.osType === osType }.filter{ script => script.script like envScript }.sortBy(_.uId).sortBy { _.scriptName.asc } 
    def compiledCheckByEnvScript = Compiled(checkByEnvScript _)
    
    def checkById(uId:Rep[String],osType:Rep[String]) = EnvScripts.filter { script => script.osType === osType }.filter{ script => script.uId like uId }.sortBy(_.uId).sortBy { _.scriptName.asc } 
    def compiledCheckById = Compiled(checkById _)

    def checkByEnvScriptDupName(scriptName:Rep[String]) = EnvScripts.filter{ script => script.scriptName === scriptName } 
    def compiledCheckByEnvScriptDupName = Compiled(checkByEnvScriptDupName _)
    
    
    
  
}