<template>
  <section class="text-page">
    <v-row>
      <v-col>
        <h3>About</h3>

        <p>
          <b>An exact representation of the identity of your app:</b> <br />
          UploaderX is an app that makes uploading music to YouTube as easy as
          possible. UploaderX itself will create a video file from your audio
          file using all its data and meta tags and upload it to YouTube.
          UploaderX is a great helper for all music lovers who share their
          collection on YouTube.
        </p>
        <p>
          <b>What will this app do with user data?</b> <br />
          The only user data received are: name, email and profile picture. They
          will be saved and re-displayed to the user. This data will be used to
          authenticate the user via YouTube Api and upload the file to his
          account.
        </p>
        <p>
          <b>How does this app enhance user functionality?</b> <br />
          UploaderX allows the user to upload music to their YouTube channel in
          at least 2 steps: upload the audio file and click upload. UploaderX
          will do the rest for you. You can also take advantage of the
          additional design and description settings of your video. You can
          upload your own cover art or choose a design template you like. The
          description for your video is taken both from your file and from the
          Discogs database via Discogs API
        </p>

        <h4>Google OAuth2 Limited Use Disclosure</h4>
        <p>
          UploaderX App's use and transfer to any other app of information
          received from Google APIs will adhere to
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            >Google API Services User Data Policy</a
          >, including the Limited Use requirements.
        </p>

        <h4>Copyright</h4>
        <p>
          If you have a copyright complaint, please tell me and include the
          Advanciti App page that contains the alleged content. identification
          of the work claimed to have been infringed including the name and
          reply email address of the copyright holder/representative, an
          assertion that the use of the material is not authorized and an
          assertion that you are the copyright holder/representative.
        </p>
      </v-col>
    </v-row>
  </section>
</template>

<script>
export default {
  data() {
    return {
      showLogging: false,
    };
  },
  methods: {},
  mounted() {
    setTimeout(() => {
      this.showLogging = true;
    }, 1000);
  },
};
</script>

<style lang="scss">
.text-page {
  padding: 8rem 4rem;

  h3 {
    margin-bottom: 2rem;
  }
  h4 {
    font-size: 1.15rem;
    margin-bottom: 1rem;
  }
  p {
    line-height: 1.5;
  }
  b {
    font-weight: 600;
  }
}
</style>
