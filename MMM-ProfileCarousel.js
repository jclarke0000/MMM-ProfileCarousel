Module.register("MMM-ProfileCarousel", {

  defaults: {
    profiles: ["L_CALENDAR","L_FORECAST","L_NOTES"],
    carouselDelay: 10000, //10 seconds
    carouselResumeDelay: 1 * 60 * 1000, //1 minute
    keyInputIgnoreDelay: 1500,
  },

  currentProfile: 0,
  carouselTimer: null,
  carouselResumeDelayTimer: null,

  start: function() {

    var self = this;
    this.isTransitioning = false;

    window.addEventListener("keydown", function(key) {
      if (!self.isTransitioning) {
        switch (key.code) {
          case "ArrowRight":
            self.stopCarousel();
            self.nextProfile();
            self.resetResumeCarouselTimer();
            break;
          case "ArrowLeft":
            self.stopCarousel();
            self.previousProfile();
            self.resetResumeCarouselTimer();
            break;
        }
      }
    });

    this.startCarousel();

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
  }




});