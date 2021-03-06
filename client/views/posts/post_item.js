Template.post_item.created = function () {
  instance = this;
};

Template.post_item.helpers({
  postLink: function(){
    return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
  },

  myLink: function() {
      return document.URL;
  },

  sourceLink: function(){
    return !!this.url ? this.url : "/posts/"+this._id;
  },
  postTarget: function() {
    return !!this.url ? '_blank' : '';
  },
  oneBasedRank: function(){
    if(typeof this.rank != 'undefined')
      return this.rank + 1;
  },
  domain: function(){
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
  current_domain: function(){
    return "http://"+document.domain;
  },
  can_edit: function(){
    return canEdit(Meteor.user(), this);
  },
  authorName: function(){
    return getAuthorName(this);
  },
  profileUrl: function(){
    // note: we don't want the post to be re-rendered every time user properties change
    var user = Meteor.users.findOne(this.userId, {reactive: false});
    if(user)
      return getProfileUrl(user);
  },
  short_score: function(){
    return Math.floor(this.score*1000)/1000;
  },
  ago: function(){
    // if post is approved show submission time, else show creation time. 
    time = this.status == STATUS_APPROVED ? this.postedAt : this.createdAt;
    return moment(time).fromNow();
  },
  timestamp: function(){
    time = this.status == STATUS_APPROVED ? this.postedAt : this.createdAt;
    return moment(time).format("MMMM Do, h:mm:ss a");
  },
  voted: function(){
    var user = Meteor.user();
    if(!user) return false; 
    return _.include(this.upvoters, user._id);
  },
  userAvatar: function(){
    var author = Meteor.users.findOne(this.userId, {reactive: false});
    if(!!author)
      return getAvatarUrl(author);
  },
  inactiveClass: function(){
    return (isAdmin(Meteor.user()) && this.inactive) ? i18n.t('inactive') : "";
  },
  categoryLink: function(){
    return getCategoryUrl(this.slug);
  },
  commentsDisplayText: function(){
    return this.comments == 1 ? i18n.t('comment') : i18n.t('comments');
  },
  pointsUnitDisplayText: function(){
    return this.upvotes == 1 ? i18n.t('point') : i18n.t('points');
  },
  isApproved: function(){
    return this.status == STATUS_APPROVED;
  },
  viaTwitter: function () {
    return !!getSetting('twitterAccount') ? 'via='+getSetting('twitterAccount') : '';
  },
  isVideo: function() {
      if (this.url) {
          var a = document.createElement('a');
          a.href = this.url;
          domain= a.hostname;
          console.log(domain);
          if (domain == 'www.youtube.com' || domain == 'youtube.com' || domain == 'youtu.be') {
                  return true;
          }
      }
      return false;
  },
    video:function(){
        var a = document.createElement('a');
        a.href = this.url;
        domain= a.hostname;
        console.log(domain);
        if (domain == 'www.youtube.com' || domain == 'youtube.com') {
            var video_id = this.url.split('v=')[1];
            return '<div class="video-container">'
                +'<iframe src="http://www.youtube.com/embed/'+video_id+'" frameborder="0" width="560" height="315"></iframe>'
            +'</div>'
        } else {
            var video_id = this.url.split('.be/')[1];
            return '<div class="video-container">'
                +'<iframe src="http://www.youtube.com/embed/'+video_id+'" frameborder="0" width="560" height="315"></iframe>'
                +'</div>'

        }
    }
});

Template.post_item.events({
  'click .upvote-link': function(e, instance){
    var post = this;
    e.preventDefault();
    if(!Meteor.user()){
      Router.go('/signin');
      throwError(i18n.t("Please log in first"));
    }
    Meteor.call('upvotePost', post, function(error, result){
      trackEvent("post upvoted", {'_id': post._id});
    });
  },
  'click .share-link': function(e){
    var $this = $(e.target).parents('.post-share').find('.share-link');
    var $share = $this.parents('.post-share').find('.share-options');
    e.preventDefault();
    $('.share-link').not($this).removeClass("active");
    $(".share-options").not($share).addClass("hidden");
    $this.toggleClass("active");
    $share.toggleClass("hidden");
  },
  'click .approve-link': function(e, instance){
    Meteor.call('approvePost', this);
    e.preventDefault();
  },  
  'click .unapprove-link': function(e, instance){
    Meteor.call('unapprovePost', this);
    e.preventDefault();
  }
});

Template.post_item.rendered=function() {
    console.log(this.data);
    if (this.data) {

        var a = document.createElement('a');
        var video_id;
        var url = this.data.url;
        a.href = url;
        var domain= a.hostname;
        console.log(domain);
        if (domain == 'www.youtube.com' || domain == 'youtube.com') {
            video_id = url.split('v=')[1];
        } else {
            video_id = url.split('.be/')[1];
        }

        var ogImg='http://img.youtube.com/vi/'+video_id+'/maxresdefault.jpg'

        var ogMetaTag = document.createElement('meta');
        ogMetaTag.setAttribute("property","og:image");
        ogMetaTag.content = ogImg;
        document.getElementsByTagName('head')[0].appendChild(ogMetaTag);

    }
}