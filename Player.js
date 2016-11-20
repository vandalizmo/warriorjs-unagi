class Player {
   _maxWarriorHealth = 20;
   _maxSludgeHealth = 12;
   _maxThickSludgeHealth = 24;
   _maxArcherHealth = 7;
   _maxWizardHealth = 3;

   _sludgeDamage = 3;
   _thickSludgeDamage = 3;
   _archerDamage = 3;
   _wizardDamage = 11;

   _meleeDamage = 5;
   _bowDamage = 3;

   _hitByArcher = false;
   _hitByWizard = false;

   _health = 20;
   _rangeAttack = false;
   _lastAction = 'start';
   _actionHistory = [];

   _lostHealth = false;
   _killedEnemy = false;

   _fightMode = 'aggressive';

   _safeActions = ['rest', 'walk'];
   _fightActions = ['attack', 'shoot'];

   _enemyType = null;

   // _exploreStrategy = ['forward', 'backward'];
   // _exploreStrategy = ['backward', 'forward'];
   _exploreStrategy = ['forward'];
   _exploreCurrentDirection = null;

   _shootForwardBackwardAlternate = false;
   _lastShotDirection = 'forward';

   _enemiesCount = 0;

   /*
   map
   _ - empty, notexplored
   x - empty, explored
   e - unknown enemy
   s
   S
   a
   w
   C 
   # - wall
   > - stairs

   */
   _map = ['x'];

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

   shoot2(warrior, direction) {
      direction = direction || this._exploreCurrentDirection;

      warrior.shoot(direction);
      this.actionLog('shoot');
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

   isEnemyInSight(warrior, direction) {
      direction = direction || this._exploreCurrentDirection;

      const unit = warrior.look(direction).find(space => !space.isEmpty());

      return unit && unit.isEnemy();
   }

   isStairsInSight(warrior, direction) {
      direction = direction || this._exploreCurrentDirection;

      const unit2 = warrior.look(direction).find(space => (!space.isEmpty() || space.isStairs()));

      return unit2 && unit2.isStairs();
   }

   isCaptiveInSight(warrior, direction) {
      direction = direction || this._exploreCurrentDirection;

      const unit = warrior.look(direction).find(space => (!space.isEmpty()));

      return unit && unit.isCaptive();
   }

   enemiesInSight(warrior, direction = this._exploreCurrentDirection) {
      const count = warrior.look(direction).reduce(function (a, s) {
         return a + (s.isEnemy() ? 1 : 0);
      }, 0);

      return count;
   }


   sense(warrior) {
      var healthChange = this._health - warrior.health();

      this._lostHealth = false;
      this._rangeAttack = false;

      this._hitByWizard = false;
      this._hitByArcher = false;

      if (healthChange > 0) {
         this._lostHealth = true;
         this._rangeAttack = true;

         switch (healthChange) {
            case this._wizardDamage:
               this._hitByWizard = true;
               break;
            case this._archerDamage:
               this._hitByArcher = true;
         }
      }

      if (warrior.health() <= 12) {
         this._fightMode = 'cautious';
      }
   }

   decide(warrior) {
      var action = null;
      var direction = null;

      var f = warrior.feel(this._exploreCurrentDirection);
      // var hear = warrior.listen();
      var lookBackward = warrior.look(this.backwardDirection());
      var lookForward = warrior.look(this._exploreCurrentDirection);

      var viewBackward = lookBackward.reduce(function(a, s) {
         return a.concat(s.isCaptive() ? 'C' : s.isEnemy() ? 'e' : s.isWall() ? '#' : s.isStairs() ? '>' : s.isEmpty() ? '_' : '?');
      }, '');

      var viewForward = lookForward.reduce(function(a, s) {
         return a.concat(s.isCaptive() ? 'C' : s.isEnemy() ? 'e' : s.isWall() ? '#' : s.isStairs() ? '>' : s.isEmpty() ? '_' : '?');
      }, '');

      this._enemiesCount = this.enemiesInSight(warrior);

      var sis = this.isStairsInSight(warrior);

      console.log('%s@%s h:%d e:%d sis:%d %s ', viewBackward.split('').reverse().join(''), viewForward, this._health, this._enemiesCount, sis, this._fightMode);

      // console.log('_:%d >:%d e:%d', f.isEmpty(), f.isStairs(), f.isEnemy());

      // if (this._enemiesCount == 0) {
      //    action = this.walk2;
      // } else {

      //    if (this._lastAction == 'shoot') {
      //       action = this.walk2;

      //       if (f.isEnemy()) {
      //          action = this.attack2;
      //       }
      //    } else {
      //       if (this._rangeAttack) {
      //          action = this.shoot2;
      //       } else {
      //          action = this.walk2;
      //       }

      //       if (f.isEnemy()) {
      //          action = this.attack2;
      //       }
      //    }

      //    if (!this._rangeAttack) {
      //       if (f.isEnemy()) {
      //          action = this.attack2;

      //          if (warrior.health() <= 3) {
      //             action = this.retreat2;
      //          }
      //       } else {
      //          if (warrior.health() <= 12) {
      //             action = this.rest2;
      //          }
      //       }
      //    }
      // }

      if (f.isStairs()) {
         action = this.walk2;
      }

      if (f.isCaptive()) {
         action = this.rescue2;
      }

      if (f.isWall()) {
         action = this.pivot2;
      }

      if (f.isEmpty()) {
         action = this.walk2;
      }

      switch (this._fightMode) {
         case 'aggressive':
            if (f.isEnemy()) {
               action = this.attack2;
            }
            break;
         case 'cautious':
         default:
            if (warrior.health() <= (2 * this._archerDamage)) {
               action = this.rest2;
            }

            if (this.isStairsInSight(warrior)) {
               action = this.walk2;
            }

            if (f.isCaptive()) {
               action = this.rescue2;
            }

            if (this.isEnemyInSight(warrior)) {
               action = this.shoot2;
            }
            if (this.isEnemyInSight(warrior, this.backwardDirection())) {
               action = this.shoot2;
               direction = this.backwardDirection();
            }

            if (this.isEnemyInSight(warrior) && this.isEnemyInSight(warrior, this.backwardDirection())) {
               direction = this.backwardDirection(this._lastShotDirection);
               this._lastShotDirection = direction;
            }

            if (f.isEnemy()) {
               action = this.attack2;
            }
      }

      return {
         action: action,
         direction: direction
      };
   }

   doAction(warrior, decision) {
      decision.action.call(this, warrior, decision.direction);
   }

   playTurn(warrior) {
      this.sense(warrior);

      this.doAction(warrior, this.decide(warrior));

      this._health = warrior.health();
   }
}