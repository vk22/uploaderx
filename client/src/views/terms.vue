<template>
  <section class="text-page">
    <v-row>
      <v-col>
        <h3>Terms and Conditions</h3>
        <p>
          By using uploader-x.com, you agree to be bound by the following terms
          and conditions :
        </p>
        <br />
        <ul>
          <li>
            If you upload to YouTube via uploader-x.com,
            <b
              >you agree to be bound by the
              <a href="https://www.youtube.com/t/terms"
                >YouTube Terms Of Service</a
              ></b
            >
          </li>
          <li>
            You agree to not use uploader-x.com services to upload any content
            that infringes any patent, trademark, trade secret, copyright or
            other proprietary rights of any party.
          </li>
          <li>
            By using the uploader-x.com service, you represent and warrant that
            you are the author and copyright owner and/or proper licensee with
            respect to any uploaded content and you further represent and
            warrant that no content violates the trademark or rights of any
            third party.
          </li>
          <li>
            You agree to not use uploader-x.com services to upload any content
            that spreads messages of terror or depicts torture, related to
            pornography, or harm minors in any way. This includes any form of
            child pornography, animal sex, violence, scat or any other illegal
            content.
          </li>
        </ul>
        <br />
        <p>
          Failure to do so may get your account banned by YouTube -
          uploader-x.com also reserves the right to suspend your service in such
          an event.
          <br />
          uploader-x.com relies heavily on APIs provided by YouTube. Therefore,
          the service cannot be guaranteed if any of these are not functioning.
          <br />
          Features may have to be added/changed/removed as and when APIs (or
          their rules) are changed.
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
  p {
    line-height: 1.5;
  }
}

</style>
