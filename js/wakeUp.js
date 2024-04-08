import {InputHandler} from "./input.js";
import {Button} from "./button.js";
import {Gravity, Path} from "./gravity.js";

export class WakeUp {

  constructor(game, character) {
    this.game = game

    this.isVisible = false
    this.image = document.getElementById("the-sleeping-area")
    this.characterImg = document.getElementById("sleep-" + character)
    this.backButton = new Button(this, 30, 30, 150, 140, document.getElementById("btn_back"), ev => {
      this.goBack()
    })
    this.stayInBedButton = new Button(this, 190, 217, 288, 52, null, ev => {
      console.log("clicked on stay in bed button")
    })
    this.getUpButton = new Button(this, 194, 334, 241, 70, null, ev => {
      console.log("clicked on get up button")
    })

    this.hearts = []
    this.hearts.push(new Heart(this, "left_heart", 720, 280),
      new Heart(this, "middle_heart", 840, 230),
      new Heart(this, "right_heart", 891, 321))
  }
  update() {
    this.hearts.forEach((h, i) => {
      h.update()
    })
  }

  draw(context) {
    context.drawImage(this.image, 0, 0)
    this.hearts.forEach((h, i) => {
      h.draw(context)
    })

    context.drawImage(this.characterImg, 574, 398, 321,158)
    this.backButton.draw(context)
  }

  setIsVisible(isVisible) {
    this.isVisible = isVisible
  }

  goBack() {
    this.game.pop()
  }
}

class Heart {
  constructor(parent, id, x, y) {
    this.parent = parent
    this.id = id
    this.image = document.getElementById(id)
    this.x = x;
    this.y = y;

    this.gravity = new Gravity(0.1)
    this.gravity.addPath(new Path(this.x, this.y, this.x, this.y, this.y - 70, true))
  }

  update() {
    let d = this.gravity.updateDisplacement()
    this.x = d.x
    this.y = d.y
  }

  draw(context) {
    context.drawImage(this.image, this.x, this.y)
  }
}
