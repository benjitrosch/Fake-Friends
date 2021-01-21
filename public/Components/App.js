import React, { Component } from 'react';
import {
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import Menu from './Menu.js';
import QuestionContainer from './QuestionContainer.js';
import UserSurveys from './UserSurveys.js';
import Login from './Login.js';
import Enter from './Enter.js';
import Game from './Game.js';
import Navbar from './Navbar.js';

const init = {username: 'NO USER FOUND', create: false, enterRoom: false, questions: []};

class App extends Component {

  constructor(props){
    super(props);

    this.getUsername = this.getUsername.bind(this);
    this.getSurveys = this.getSurveys.bind(this);

    this.createNewSurvey = this.createNewSurvey.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.sendSurvey = this.sendSurvey.bind(this);
    this.exitSurvey = this.exitSurvey.bind(this);
    this.exitMySurveys = this.exitMySurveys.bind(this);
    
    this.openRoomPrompt = this.openRoomPrompt.bind(this);
    this.exitRoomPrompt = this.exitRoomPrompt.bind(this);
    this.enterRoomCode = this.enterRoomCode.bind(this);
    this.exitGame = this.exitGame.bind(this);

    this.callReset = this.callReset.bind(this);

    this.question = React.createRef();
    this.login = React.createRef();
    
    this.state = init;
  }

  getUsername(){

    const id = this.login.current.getUserID();

    fetch(`/user/${id}`)
      .then(response=>response.json())
      .then(data=>{
        console.log(data)
        this.setState({...this.state, username: data})
      });
  }

  getSurveys(){

    const id = this.login.current.getUserID();

    fetch(`/user/survey/${id}`)
      .then(response=>response.json())
      .then(data=>{
        this.setState({...this.state, userSurveys: data});
      });

  }

  // sets this.state.create to true so that the new survey popup will display
  createNewSurvey(){
    this.setState({...this.state, create: true});
  }
  // when the user submits a new question this function adds that function to the array of questions in state
  addQuestion(){
    const newQuestion = this.question.current.submitQuestion();
    const questionArr = [...this.state.questions];
    questionArr.push(newQuestion);
    this.setState({...this.state, questions: questionArr});
  }
  // after adding the last question in the survey send the array of questions to the backend to be written to the DB
  sendSurvey(event){
    event.preventDefault();
    const body = {
      questions: this.state.questions,
      user_id: this.login.current.getUserID(),
    };

    fetch(`/survey/addsurvey`, {method: 'POST', headers: {'Content-Type': 'Application/JSON'}, body: JSON.stringify(body)})
      .then(res=>res.json())
      .then(data=>this.question.current.showResults(data))
      .catch(err => console.log(`Error sending survey to db: ${err}`));
  }

  // event handler for when the user exits the create survey popup 
  exitSurvey(){
    this.setState({...this.state, create: false, enterRoom: false, questions: []});
  }
  
  exitMySurveys(){
    this.setState({...this.state, userSurveys: null});
  }
  // sets this.state.enterRoom to true which causes the enter room code popup to display
  openRoomPrompt(){
    this.setState({...this.state, enterRoom: true});
  }

  // event handler for when the user clicks the submit button on the room code popup 
  enterRoomCode(event, room){
    event.preventDefault();
    // sends a request to the backend to validate the room
    fetch(`/survey/${room}`)
      .then(response=>response.json())
      .then(data=>{
        if (data){
          // if the code is valid, redirect the user to the room page
          this.setState({...this.state, create: false, enterRoom: false, questions: [], room, redirectGame: true, redirectHome: false})
        }
        else return;
      });
  }

  // sets this.state.enterRoom to false so the room code popup unmounts
  exitRoomPrompt(){
    this.setState({...this.state, enterRoom: false});
  }

  // sets this.state.redirectGame to false so the <Redirect /> componenet unmounts and the user is sent back to the home page
  exitGame(){
    this.setState({...this.state, redirectHome: true, redirectGame: false})
  }

  callReset(){
    this.login.current.resetLogin();
  }

  render() {
    // logic to handle conditional popups
    // these lines control the crete survey and enter room popups
    const questions = this.state.create ? <QuestionContainer ref={this.question} clickEvent={this.addQuestion} submit={this.sendSurvey} exit={this.exitSurvey} number={this.state.questions.length} questions={this.state.questions} /> : <div></div>;
    const surveys = this.state.userSurveys ? <UserSurveys surveys={this.state.userSurveys} exit={this.exitMySurveys} /> : <div></div>;
    const enter = this.state.enterRoom ? <Enter submit={this.enterRoomCode} exit={this.exitRoomPrompt} /> : <div></div>;

    // logic to handle redirects to game room and homepage
    const redirectGame = this.state.redirectGame ? <Redirect to={{pathname: '/game'}} push/> : <div></div>;
    const redirectHome = this.state.redirectHome ? <Redirect to={{pathname: '/'}} push/> : <div></div>;
    
    // defines the homepage
    const home = (
      <div className='container'>
        <Login ref={this.login} updateUsername={this.getUsername} />
        <div id='splash' style={this.state.create || this.state.enterRoom ? {filter: `brightness(${'75%'}) blur(2px)`} : {filter: `brightness(${'100%'}) blur(0px)`}}>
          <h1 id='title'>FAKE FRIENDS</h1>
          <h1 id='tagline'>"NOBODY LIKES YOU!"</h1>
          <h3>Choose your game-mode:</h3>
          <Menu newSurvey={this.createNewSurvey} getSurveys={this.getSurveys} enterRoom={this.openRoomPrompt} enabled={!this.state.create && !this.state.enterRoom} />
        </div>
        {questions}
        {surveys}
        {enter}
        {redirectGame}
      </div>
    );
    // defines the game page
    const game = (
      <div>
        <Game room={this.state.room} username={this.state.username} exitGame={this.exitGame} />
        {redirectHome}
      </div>
    );
    
    return (
      <div id='app'>
        <Navbar username={this.state.username} login={this.callReset} /><div id='bottombar' />
        <Switch>
          <Route exact path='/'>{home}</Route>
          <Route exact path='/game'>{game}</Route>
        </Switch>
      </div>
    );
  }
}

export default App;
