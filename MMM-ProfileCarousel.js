Module.register("MMM-ProfileCarousel", {

  defaults: {
    profiles: ["L_CALENDAR","L_FORECAST","L_NOTES"],
    carouselDelay: 10000, //10 seconds
    carouselResumeDelay: 1 * 60 * 1000, //1 minute
    keyInputIgnoreDelay: 1500,
    useScreensaver: true,
    screensaverProfile: "L_WORDCLOCK",
    screensaverTimeout: 10.25 * 60 * 1000 //10m 15s
  },

  currentProfile: 0,
  carouselTimer: null,
  carouselResumeDelayTimer: null,
  screensaverTimer: null,
  screensaverActive: false,
  screensaverBlackoutPeriodActive: false,

  getScripts: function() {
    return ["moment.js"];
  },

  start: function() {

    var self = this;
    this.isTransitioning = false;

    window.addEventListener("keydown", function(key) {
      if (!self.isTransitioning) {
        switch (key.code) {
          case "ArrowRight":
            self.navRight();
            break;
          case "ArrowLeft":
            self.navLeft();
            break;
          case "Space":
            self.navSelect();
            break;          
        }
      }
    });

    this.startCarousel();

    if (this.config.useScreensaver) {
      this.startScreensaverTimer();

      if (this.config.screensaverBlackoutPeriod) {      
        this.startScreensaverBlackoutHeartbeat();
      }

    }

  },

  //Navigation input functions
  navRight: function() {
    this.resetScreensaver();
    this.stopCarousel();
    this.nextProfile();
    this.resetResumeCarouselTimer();
  },

  navLeft: function() {
    this.resetScreensaver();
    this.stopCarousel();
    this.previousProfile();
    this.resetResumeCarouselTimer();
  },

  navSelect: function() {
    if (this.screensaverActive) {
      this.resetScreensaver();
      this.resetResumeCarouselTimer();
    }
  },

  nextProfile: function() {
    if (!this.isTransitioning) {
      this.currentProfile = this.currentProfile + 1;
      if (this.currentProfile == this.config.profiles.length) {
        this.currentProfile = 0;
      }


      this.setProfile();

    }
  },

  previousProfile: function() {
    if (!this.isTransitioning) {
      this.currentProfile = this.currentProfile - 1;
      if (this.currentProfile == -1) {
        this.currentProfile = this.config.profiles.length - 1;
      }

      this.setProfile();
    }
  },

  setProfile: function() {
    var self = this;
    this.isTransitioning = true;
    this.sendNotification("CURRENT_PROFILE", this.config.profiles[this.currentProfile]);
    window.setTimeout(function() {
      self.isTransitioning = false;
    }, this.config.keyInputIgnoreDelay);
  },

  startCarousel: function() {
    var self = this;
    this.carouselTimer = window.setInterval(function() {
      self.nextProfile();
    }, this.config.carouselDelay);
  },

  stopCarousel: function() {
    window.clearInterval(this.carouselTimer);
    this.carouselTimer = null;
  },

  resetResumeCarouselTimer: function() {
    var self = this;
    window.clearTimeout(this.carouselResumeDelayTimer);
    
    this.carouselResumeDelayTimer = window.setTimeout(function() {
      self.nextProfile();
      self.startCarousel();
    }, this.config.carouselResumeDelay);
  },

  startScreensaverTimer: function() {
    var self = this;
    self.screensaverTimer = window.setTimeout(function() {
      self.enableScreensaver();
    }, this.config.screensaverTimeout);
  },

  enableScreensaver: function() {
    window.clearTimeout(this.carouselResumeDelayTimer);
    this.stopCarousel();
    this.sendNotification("CURRENT_PROFILE", this.config.screensaverProfile);
    this.screensaverActive = true;
  },

  stopScreensaver: function() {
    window.clearTimeout(this.screensaverTimer);
    if (this.screensaverActive) {
      this.screensaverActive = false;
      this.setProfile();
    }
  },

  resetScreensaver: function() {
    this.stopScreensaver();
    if (this.config.useScreensaver) {
      this.startScreensaverTimer();
    }
  },

  startScreensaverBlackoutHeartbeat: function() {
    var self = this;
    window.setInterval(function() {
      self.screensaverBlackoutHeartbeatTick();
    }, 10000);
  },

  screensaverBlackoutHeartbeatTick: function() {
    var hourNow = moment().hour();
    if (this.screensaverBlackoutPeriodActive) {
      //check to see if the time is outside the range
      if (hourNow < this.config.screensaverBlackoutPeriod.start || hourNow >= this.config.screensaverBlackoutPeriod.end) {

        this.startScreensaverTimer();
        this.screensaverBlackoutPeriodActive = false;
      }
    } else {
      //check to see if the time is within the blackout range
      if (hourNow >= this.config.screensaverBlackoutPeriod.start && hourNow < this.config.screensaverBlackoutPeriod.end) {

        this.stopScreensaver();
        this.screensaverBlackoutPeriodActive = true;

      }

    }   
  }




});