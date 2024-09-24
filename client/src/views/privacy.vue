<template>
  <section class="text-page">
    <v-row>
      <v-col>
        <h3>Privacy Policy</h3>
        <p>
          This privacy policy sets out how UploaderX uses and protects any
          information that you give UploaderX when you use this website.
        </p>
        <p>
          This website uses
          <b
            >YouTube API Services (<a
              href="https://developers.google.com/youtube/terms/developer-policies#definition-youtube-api-services"
              target="_blank"
              >link</a
            >)</b
          >
          - please see here for the
          <b
            >Google Privacy Policy (<a
              href="https://policies.google.com/privacy"
              target="_blank"
              >link</a
            >)</b
          >
        </p>
        <p>
          In addition to UploaderX's normal procedure for deleting stored
          data, you can revoke access to your data via the
          <b
            >Google security settings page (<a
              href="https://security.google.com/settings/security/permissions"
              target="_blank"
              >link</a
            >)</b
          >
        </p>
        <p>
          UploaderX is committed to ensuring that your privacy is protected.
          Should we ask you to provide certain information by which you can be
          identified when using this website, then you can be assured that it
          will only be used in accordance with this privacy statement.
        </p>
        <p>
          UploaderX may change this policy from time to time by updating this
          page. You should check this page from time to time to ensure that you
          are happy with any changes. This policy is effective from 01/04/2023.
        </p>
        <b>When you authenticate with Google - we use the YouTube Scope to:</b>
        <ul>
          <li>Retrieve YouTube Channel information</li>
          <li>Retrieve OAuth Access Token</li>
          <li>Allow UploaderX to upload the video to your YouTube account</li>
        </ul>
        Potentially it gives UploaderX the ability to:
        <ul>
          <li>View and manage your videos and playlists</li>
          <li>
            View and manage your YouTube activity, including posting public
            comments - of course we will NOT do this!
          </li>
        </ul>
        <br />
        <b>What we do with the information we gather:</b>
        <br />
        <br />
        The information will be stored for analytics
        <ul>
          <li>Internal record keeping.</li>
          <li>
            We may use the information to improve our products and services.
          </li>
          <li>
            We may send promotional emails about new products, special offers or
            other information which we think you may find interesting using the
            email address which you have provided.
          </li>
          <li>
            We are committed to ensuring that your information is secure. In
            order to prevent unauthorised access or disclosure, we have put in
            place suitable physical, electronic and managerial procedures to
            safeguard and secure the information we collect online.
          </li>
          <li>
            We will NOT share your data with anyone, unless we have a subpoena
            for information
          </li>
        </ul>
        <br />
        <b>How we use cookies</b>
        <br />
        <br />
        A cookie is a small file which asks permission to be placed on your
        computer's hard drive. Once you agree, the file is added and the cookie
        helps analyse web traffic or lets you know when you visit a particular
        site. Cookies allow web applications to respond to you as an individual.
        The web application can tailor its operations to your needs, likes and
        dislikes by gathering and remembering information about your
        preferences.
        <br />
        We use traffic log cookies to identify which pages are being used. This
        helps us analyse data about webpage traffic and improve our website in
        order to tailor it to customer needs. We only use this information for
        statistical analysis purposes and then the data is removed from the
        system.
        <br />
        Overall, cookies help us provide you with a better website by enabling
        us to monitor which pages you find useful and which you do not. A cookie
        in no way gives us access to your computer or any information about you,
        other than the data you choose to share with us.
        <br />
        You can choose to accept or decline cookies. Most web browsers
        automatically accept cookies, but you can usually modify your browser
        setting to decline cookies if you prefer. This may prevent you from
        taking full advantage of the website.
        <br />
        <br />
        <b>Links to other websites</b>
        <br />
        <br />
        Our website may contain links to other websites of interest. However,
        once you have used these links to leave our site, you should note that
        we do not have any control over that other website - this includes
        Google/YouTube. Therefore, we cannot be responsible for the protection
        and privacy of any information which you provide whilst visiting such
        sites and such sites are not governed by this privacy statement. You
        should exercise caution and look at the privacy statement applicable to
        the website in question.
        <br />
        <br />
        <b>Controlling your personal information</b>
        <br />
        <br />
        You may choose to restrict the collection or use of your personal
        information in the following ways:
        <ul>
          <li>
            whenever you are asked to fill in a form on the website, look for
            the box that you can click to indicate that you do not want the
            information to be used by anybody for direct marketing purposes if
            you have previously agreed to us using your personal information for
            direct marketing purposes, you may change your mind at any time by
            writing to or emailing us at info@UploaderX.com
          </li>
          <li>
            We will not sell, distribute or lease your personal information to
            third parties unless we have your permission or are required by law
            to do so. We may use your personal information to send you
            promotional information about third parties which we think you may
            find interesting if you tell us that you wish this to happen.
          </li>
        </ul>
        <br />
        You may request details of personal information which we hold about you
        under the Data Protection Act 1998. A small fee will be payable. If you
        would like a copy of the information held on you please write to
        info@UploaderX.com
        <br />
        <br />
        If you believe that any information we are holding on you is incorrect
        or incomplete, please write to or email us as soon as possible at the
        above address. We will promptly correct any information found to be
        incorrect.
        <br />
        You may be able to opt out of some Ads at
        <a href="http://optout.networkadvertising.org/?c=1"
          >http://optout.networkadvertising.org/?c=1</a
        >
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
