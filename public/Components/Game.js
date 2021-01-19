import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import UserContainer from './UserContainer.js';
import GameQuestion from './GameQuestion.js';
import Timer from './Timer.js';
import ConfettiMachine from './ConfettiMachine.js';

let socket;

class Game extends Component {
    constructor(props){
        super(props);

        this.collapseUsers = this.collapseUsers.bind(this);
        this.emitAnswer = this.emitAnswer.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
        this.oneSecond = this.oneSecond.bind(this);
        this.startGame = this.startGame.bind(this);

        socket = io.connect();
        socket.on('roomfull', data => {
            this.props.exitGame();
        })
        socket.on('joinedroom', data => {
            this.setState({...this.state, users: data.users, survey: data.survey.questions, questionNum: 0, answered: false});
        });
        socket.on('readyup', data => {
            const newReady = this.state.ready + 1;
            this.setState({...this.state, ready: newReady});
        })
        socket.on('startgame', data => {
            setInterval(() => this.oneSecond(), 1000);
            const newReady = this.state.ready + 1;
            this.setState({...this.state, started: true, answered: false})
        });
        socket.on('nextquestion', data => {
            this.nextQuestion(data);
        });
        socket.on('winner', data => {
            this.setState({...this.state, winner: data});
        });
        
        this.state={socket, users: [], showUsers: true, counter: 30, started: false, ready:0, gameOver: false};
    }

    collapseUsers(){
        this.setState({...this.state, showUsers: !this.state.showUsers});
    }

    startGame(){
        const data = {
            id: this.state.socket.id,
            room: this.props.room,
        }

        socket.emit('ready', data);
        this.setState({...this.state, answered: true});
    }

    emitAnswer(answer){
        const isCorrect = (answer === this.state.survey[this.state.questionNum].answer);
        const data = {id: this.state.socket.id, room: this.props.room, isCorrect}
        socket.emit('submitanswer', data);

        this.setState({...this.state, answered: true});
    }

    nextQuestion(data){

        if (this.state.questionNum === 4){
            this.setState({...this.state, users: data, questionNum: 5, started: false, gameOver: true});
            socket.emit('gameover', {room: this.props.room});
            return;
        }

        const newQuestionNum = this.state.questionNum + 1;
        this.setState({...this.state, users: data, questionNum: newQuestionNum, answered: false, counter: 30});
    }

    oneSecond(){
        const newTime = this.state.counter - 1;

        if (newTime <= 0){
            const data = {id: this.state.socket.id, room: this.props.room, isCorrect: false}
            socket.emit('submitanswer', data);

            this.setState({...this.state, answered: true});
        }
        else this.setState({...this.state, counter: newTime});
    }

    componentDidMount(){

        if(!this.props.room)
            this.props.exitGame();

        const root = document.getElementById('root');
        root.style.width = '100%';
        root.style.backgroundColor = 'black';

        this.setState({socket});
        
        socket.emit('checkoccupancy', this.props.room);  // should we return here? will componenetDidMount keep running after this emit? 

        const data = {
            room: this.props.room,
            name: this.props.username,
        }

        socket.emit('joinroom', data);
    }

    render(){

        const users = this.state.showUsers ? <UserContainer users={this.state.users} room={this.props.room} /> : <div></div>;

        const timer = !this.state.gameOver ? <Timer time={this.state.counter} /> : <div></div>;

        const startbutton = this.state.started || this.state.gameOver ? <div></div> : (
            <div id='startbtn'>
                Waiting for {this.state.users.length - this.state.ready} players...
                <button onClick={this.startGame} disabled={this.state.answered || this.state.users.length === 0}>Start Game</button>
            </div>);

        const nextquestion = this.state.survey && this.state.started && !this.state.gameOver ? (
            <div>
                <GameQuestion question={this.state.survey[this.state.questionNum].question} answered={this.state.answered} clickEvent={this.emitAnswer} />
            </div>) : <div></div>;

        const results = this.state.gameOver && this.state.winner ? (
            <div className='modal' id='exitgame' >
                <div className='header'>Results</div>
                <form>
                    <h4 style={{textAlign: 'center'}}>Congrats to {this.state.winner.name} for being a real friend,<br/>with {this.state.winner.score} total points!</h4>
                    <button onClick={this.props.exitGame} >Exit</button>
                </form>
            </div>) : <div></div>;

        const confetti = this.state.gameOver ? (
            <ConfettiMachine />) : <div></div>;

        return(
            <div>
                <button id='collapsebtn' onClick={this.collapseUsers} style={this.state.showUsers ? {marginLeft: '18%'} : {marginLeft: '0%'} } >{this.state.showUsers ? '<' : '>'}</button>
                <button id='leavegamebtn' onClick={this.props.exitGame} >Leave Game</button>
                {users}
                {nextquestion}
                {startbutton}
                {results}
                {confetti}
                {timer}
            </div>
        )
    }
}
export default withRouter(Game);