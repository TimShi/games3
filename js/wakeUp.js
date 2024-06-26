import {InputHandler} from "./input.js";
import {Button} from "./button.js";
import {Jump, Path, withDone, withSkipCondition} from "./physics/jump.js";
import {DressUp} from "./dressUp.js";

//state of this screen
const state_wake_zero_heart = 0
const state_wake_two_heart = 2
const state_wake_three_heart = 3

const heart_loc_snooze_button = {x: 86, y:200}
const heart_loc_get_up_button= {x: 90, y:313}
const heart_loc_back_button= {x:194, y:50}
const heart_loc_left = {x:720, y:280}
const heart_loc_middle = {x:840, y:230}
const heart_loc_right = {x:891, y:321}

const snoozeRep = 5
export class WakeUp {

  constructor(game, character) {
    this.game = game
    this.character = character

    this.isVisible = false
    this.image = document.getElementById("the-sleeping-area")
    this.characterImg = document.getElementById("sleep-" + character)
    this.backButton = new Button(this, 30, 30, 150, 140, document.getElementById("btn_back"), ev => {
      this.goBack()
    })
    this.stayInBedButton = new Button(this, 180, 210, 288, 70, null, ev => {
      this.snooze()
    })
    this.getUpButton = new Button(this, 190, 340, 250, 80, null, ev => {
      this.getUp()
    })

    this.state = state_wake_zero_heart

    this.hearts = []
    this.hearts.push(this.makeHeart("left_heart"), this.makeHeart("middle_heart"), this.makeHeart("right_heart"))
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

  wakedHeart() {
    if (this.state < state_wake_three_heart) {
      this.state++
    }
  }

  snoozedHeart() {
    if (this.state > state_wake_zero_heart) {
      this.state--
    } //TODO: do something to acknowledge button press
  }

  snooze() {
    if (this.state == state_wake_three_heart) {
      for (let i = 0; i < this.hearts.length; i++) {
        this.snoozeHeart(this.hearts[i])
      }
    }
  }

  getUp() {
    this.game.push(new DressUp(this.game, this.character))
  }

  makeHeart(id) {
    let src_loc
    let target_loc
    let src_bounce_height = 70
    let target_bounce_height = 50
    let jump_height = 700
    if (id == "left_heart") {
      src_loc = heart_loc_left
      target_loc = heart_loc_get_up_button
    } else if (id == "middle_heart") {
      src_loc = heart_loc_middle
      target_loc = heart_loc_snooze_button
    } else if (id == "right_heart") {
      src_loc = heart_loc_right
      target_loc = heart_loc_back_button
    } else {
      return null
    }

    let h = new Heart(this, id, src_loc.x, src_loc.y)
    for (let i = 0; i < snoozeRep; i++) {
      h.addMovement(new Path(src_loc, src_loc,src_loc.y - src_bounce_height, false)) //jump on top of character
    }
    h.addMovement(new Path(src_loc, target_loc, src_loc.y- jump_height, false, withDone(()=>{
      this.wakedHeart()
    }))) //jump to snooze button
    h.addMovement(new Path(target_loc, target_loc, target_loc.y - target_bounce_height, true)) //jump beside the button

    return h
  }

  //move heart back to original position to bounce a few times, and when they are done, transition back to wake state
  snoozeHeart(h) {
    h.clearMovement()
    let src_loc
    let target_loc
    let target_bounce_height = 70
    let src_bounce_height = 50
    let jump_height = 700
    if (h.id == "left_heart") {
      target_loc = heart_loc_left
      src_loc = heart_loc_get_up_button
    } else if (h.id == "middle_heart") {
      target_loc = heart_loc_middle
      src_loc = heart_loc_snooze_button
    } else if (h.id == "right_heart") {
      target_loc = heart_loc_right
      src_loc = heart_loc_back_button
    } else {
      return null
    }

    h.addMovement(new Path(src_loc, target_loc, src_loc.y- jump_height, false, withDone(()=>{
      this.snoozedHeart()
    }))) //jump back to character
    //synchronize
    h.addMovement(new Path(target_loc, target_loc, target_loc.y - target_bounce_height, false, withSkipCondition(
      ()=>{
        //return false
        return this.state > state_wake_zero_heart
      }
    ))) //jump on character 3 times
    for (let i = 0; i < snoozeRep; i++) {
      h.addMovement(new Path(target_loc, target_loc, target_loc.y - target_bounce_height, false)) //jump on character 3 times
    }

    h.addMovement(new Path(target_loc, src_loc,target_loc.y - jump_height, false, withDone(() => {
      this.wakedHeart()
    }))) //jump back to buttons

    h.addMovement(new Path(src_loc, src_loc,src_loc.y - src_bounce_height, true)) //jump on buttons
    return h
  }
}

class Heart {
  constructor(parent, id, x, y) {
    this.parent = parent
    this.id = id
    this.image = document.getElementById(id)
    this.x = x;
    this.y = y;

    this.jump = new Jump(0.2)
  }

  update() {
    let d = this.jump.updateDisplacement()
    if (d != null) {
      this.x = d.x
      this.y = d.y
    }
  }

  draw(context) {
    context.drawImage(this.image, this.x, this.y)
  }

  addMovement(p) {
    this.jump.addPath(p)
  }

  clearMovement() {
    if (this.jump.paths.length > 0) {
      this.jump.paths = []
      // this.gravity.paths.slice(0, 1)
      // this.gravity.paths[0].shouldRepeat = false
    }
  }
}
