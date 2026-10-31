package services
import services.projects.objects.*
object Fixtures:
  val world = World("云海城市","","","","保持云海背景","",Nil)
  val input = GameInput("云海试炼","rpg","参考回合制小队战斗","","",world,Nil)
  val project = Project("p","owner",0,input,None,None,"2026-10-31T00:00:00Z")
