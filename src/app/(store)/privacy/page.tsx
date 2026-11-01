export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert max-w-3xl">
      <h1 className="font-display text-5xl">Privacy Policy</h1>
      <p className="mt-6 text-[#b4b4ae]">
        NINE XN GARMENTS, Old Nagar Nigam Road, Goti Maholla, Burhanpur, Madhya Pradesh 450331, collects the information
        needed to create an account, process orders, and deliver garments. Mobile numbers are used as the login identifier.
        Name, delivery address, and order history are stored in the store database so you can view them after login.
      </p>
      <p className="text-[#b4b4ae]">
        Payment card details are processed by Razorpay and are not stored on this website. Account, order, and address
        information is shown only to the signed-in customer and authorised administrators. Product and logo images are
        stored in the same MySQL database as the catalogue.
      </p>
      <p className="text-[#b4b4ae]">
        For privacy requests, call 099931 22660 and include the mobile number used on the account.
      </p>
    </article>
  );
}
