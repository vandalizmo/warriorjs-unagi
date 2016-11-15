class Player {
   _maxWarriorHealth = 20;
   _maxSludgeHealth = 12;
   _maxThickSludgeHealth = 24;
   _maxArcherHealth = 7;

   _health = 20;
   _rangeAttack = false;
   _lastAction = 'start';
   _actionHistory = [];
   _lostHealth = false;
   _killedEnemy = false;

   _safeActions = ['rest', 'walk'];
   _enemyType = null;

   _exploreStrategy = ['forward', 'backward'];
   // _exploreStrategy = ['backward', 'forward'];
   // _exploreStrategy = ['forward'];
   _exploreCurrentDirection = null;

   constructor() {
      this.getNextExploreStrategy();
   }

   getNextExploreStrategy() {
      this._exploreCurrentDirection = this._exploreStrategy.shift();
   }

   actionLog(action) {
      this._lastAction = action;
      this._actionHistory.push(this._lastAction);
   }

   rest2(warrior) {
      warrior.rest();
      this.actionLog('rest');
   }

   walk2(warrior, direction) {
      direction = direction || this._exploreCurrentDirection;

      warrior.walk(direction);
      this.actionLog('walk');
   }

   retreat2(warrior, direction) {
      direction = direction || this.backwardDirection(this._exploreCurrentDirection);

      warrior.walk(direction);
      this.actionLog('retreat');
   }

   pivot2(warrior, direction) {
      direction = direction || this.backwardDirection(this._exploreCurrentDirection);

      warrior.pivot(direction);
      this.actionLog('pivot');
   }

   attack2(warrior, direction) {
      direction = direction || this._exploreCurrentDirection;

      warrior.attack(direction);
      this.actionLog('attack');
   }

   rescue2(warrior, direction) {
      direction = direction || this._exploreCurrentDirection;

      warrior.rescue(direction);
      this.actionLog('rescue');
   }

   backwardDirection(direction) {
      direction = direction || this._exploreCurrentDirection;

      var backwardDirection = null;

      switch (direction) {
         case 'forward':
         backwardDirection = 'backward';
         break;
         case 'backward':
         backwardDirection = 'forward';
         break;
      }

      return backwardDirection;
   }

   decide(warrior) {
      var action = null;
      var direction = null;

      var f = warrior.feel(this._exploreCurrentDirection);

      if (f.isEmpty()) {
         if (this._rangeAttack) {
            action = this.walk2;
         } else {
            if (warrior.health() < this._maxWarriorHealth) {
               action = this.rest2;
            } else {
               action = this.walk2;
            }
         }
      }

      if (f.isStairs()) {
         action = this.walk2;
      }

      if (f.isEnemy()) {
         if (this._rangeAttack) {
            action = this.attack2;
         } else {
            if (warrior.health() <= 9) {
               action = this.retreat2;
            } else {
               action = this.attack2;
            }
         }
      }

      if (f.isCaptive()) {
         action = this.rescue2;
      }

      if (f.isWall()) {
         // this.getNextExploreStrategy();
         // action = null;
         action = this.pivot2;
      }

      return { action: action, direction: direction};
   }

   playTurn(warrior) {    
      if (warrior.health() < this._health) {
         this._lostHealth = true;
      } else {
         this._lostHealth = false;
      }

      if (this._safeActions.includes(this._lastAction) && this._lostHealth) {
         this._rangeAttack = true;
         this._enemyType = 'archer';
      } 

      if (this._lastAction == 'attack' && !this._lostHealth) {
         this._killedEnemy = true;
         this._enemyType = null;
         this._rangeAttack = false;
      }

      var decision;
      do {
         decision = this.decide(warrior);
      } while (decision.action == null)

      decision.action.call(this, warrior, decision.direction);

      this._health = warrior.health();
      this._killedEnemy = false;
   }
}