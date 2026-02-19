import { createPaper } from "./game/create-papers/create-paper";
import { Session, websocketReturnUpdate } from "./types";

const speed = 10; // 1000 = real time, 100 = 10x speed, 10 = 100x speed, 1 = 1000x speed

export class Clock {
    private session: Session
    private timeoutId: number | null;

    constructor(session: Session) {
        this.session = session;
        this.timeoutId = null;
    }

    private wait() {
        this.session.status = "waiting";
        this.session.round = 0;
        this.session.gameState.users.forEach(u => {
            u.playing = false
            u.myTurn = false;
            u.ready = false;
        });


        this.updateAll();
    }

    start() {
        this.session.status = "playing";
        this.session.gameState.users.forEach(u => {
            u.playing = true;
            u.paper = createPaper(this.session.gameState.rules.paperType, this.session.gameState.rules.paperModifiers);
        });
        this.session.gameState.users.sort((a, b) => a.id.localeCompare(b.id));
        this.loop();
    }

    private end() {
        console.log(`Game over after ${this.session.round} rounds`);
        this.session.status = "ended";
        this.updateAll();
        setTimeout(() => {
            this.wait();
        }, 10 * speed);
    }

    private async loop() {
        this.session.round++;
        const playingUsers = this.session.gameState.users.filter(u => u.playing);
        const currentPlayer = playingUsers[this.session.round % playingUsers.length];

        this.session.gameState.users.forEach(user => {
            user.myTurn = user.id === currentPlayer.id;
        });

        this.session.gameState.dices.forEach(dice => {
            dice.value = (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        });

        console.log(`Starting round ${this.session.round}, it's ${currentPlayer.id}'s turn`);

        this.updateAll();
        await this.waitForNextTurn();
    }

    private async waitForNextTurn() {
        this.timeoutId = self.setTimeout(() => {
            this.timeoutId = null;
            this.userTimedOut();
        }, this.session.gameState.rules.waitTime * speed);
    }


    private userTimedOut() {
        const activePlayers = this.session.gameState.users.filter(u => u.playing);
        const currentPlayer = activePlayers[this.session.round % activePlayers.length];
        currentPlayer.paper.misses++;
        this.checkIfGameOver() ? this.end() : this.loop();
    }

    userPlayed() {
        self.clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.checkIfGameOver() ? this.end() : this.loop();

    }


    private updateAll() {
        this.session.gameState.users.forEach(user => {
            user.connection.send(websocketReturnUpdate(this.session));
        });
    }


    private checkIfGameOver() {
        const activePlayers = this.session.gameState.users.filter(u => u.playing);
        if (activePlayers.some(u => u.paper?.misses >= this.session.gameState.rules.maxMisses)) {
            return true;
        }
        return false;
    }
}