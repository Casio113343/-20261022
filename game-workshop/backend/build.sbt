ThisBuild / scalaVersion := "3.3.7"
ThisBuild / organization := "local.gameworkshop"
ThisBuild / version := "0.1.0"
libraryDependencies ++= Seq(
  "org.typelevel" %% "cats-effect" % "3.5.7",
  "org.http4s" %% "http4s-ember-server" % "0.23.30",
  "org.http4s" %% "http4s-dsl" % "0.23.30",
  "org.http4s" %% "http4s-circe" % "0.23.30",
  "io.circe" %% "circe-parser" % "0.14.10",
  "io.circe" %% "circe-generic" % "0.14.10",
  "org.postgresql" % "postgresql" % "42.7.9",
  "org.typelevel" %% "munit-cats-effect" % "2.0.0" % Test
)
Test / fork := true
Compile / run / fork := true
Test / parallelExecution := false
