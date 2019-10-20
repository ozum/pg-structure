import getAdjectives from "../../src/util/get-adjectives";

describe("parser() function", () => {
  describe("(snake case)", () => {
    describe("(source first)", () => {
      it("should return -1 ifnot found.", () => {
        expect(getAdjectives("primary_product_super_product_category", "xyz", "xyz")).toEqual([undefined, undefined]);
      });

      it("should extract source and target if one name contains other.", () => {
        expect(getAdjectives("primary_product_super_product_category", "product", "product_category")).toEqual(["primary", "super"]);
        expect(getAdjectives("super_product_category_primary_product", "product", "product_category")).toEqual(["primary", "super"]);
        expect(getAdjectives("primary_product_super_product_category", "product_category", "product")).toEqual(["super", "primary"]);
        expect(getAdjectives("super_product_category_primary_product", "product_category", "product")).toEqual(["super", "primary"]);
        expect(getAdjectives("bike_option_option", "bike_option", "option")).toEqual([undefined, undefined]);
      });

      it("should extract source.", () => {
        expect(getAdjectives("primary_contact_account", "contact", "account")).toEqual(["primary", undefined]);
        expect(getAdjectives("primary_contacts_accounts", "contact", "account")).toEqual(["primary", undefined]);
      });

      it("should extract source without target table .", () => {
        expect(getAdjectives("primary_contact", "contact", "account")).toEqual(["primary", undefined]);
        expect(getAdjectives("primary_contacts", "contact", "account")).toEqual(["primary", undefined]);
      });

      it("should extract target.", () => {
        expect(getAdjectives("contact_super_account", "contact", "account")).toEqual([undefined, "super"]);
        expect(getAdjectives("contacts_super_accounts", "contact", "account")).toEqual([undefined, "super"]);
      });

      it("should extract target without source table.", () => {
        expect(getAdjectives("super_account", "contact", "account")).toEqual([undefined, "super"]);
        expect(getAdjectives("super_accounts", "contact", "account")).toEqual([undefined, "super"]);
      });

      it("should extract source and target.", () => {
        expect(getAdjectives("primary_contact_super_account", "contact", "account")).toEqual(["primary", "super"]);
        expect(getAdjectives("primary_contacts_super_accounts", "contact", "account")).toEqual(["primary", "super"]);
      });

      it("should return when there is no adjectives.", () => {
        expect(getAdjectives("contact_account", "contact", "account")).toEqual([undefined, undefined]);
        expect(getAdjectives("contacts_accounts", "contact", "account")).toEqual([undefined, undefined]);
      });
    });
    describe("(target first)", () => {
      it("should extract source.", () => {
        expect(getAdjectives("account_primary_contact", "contact", "account")).toEqual(["primary", undefined]);
        expect(getAdjectives("accounts_primary_contacts", "contact", "account")).toEqual(["primary", undefined]);
      });

      it("should extract target.", () => {
        expect(getAdjectives("super_account_contact", "contact", "account")).toEqual([undefined, "super"]);
        expect(getAdjectives("super_accounts_contacts", "contact", "account")).toEqual([undefined, "super"]);
      });

      it("should extract source and target.", () => {
        expect(getAdjectives("super_account_primary_contact", "contact", "account")).toEqual(["primary", "super"]);
        expect(getAdjectives("super_accounts_primary_contacts", "contact", "account")).toEqual(["primary", "super"]);
      });
      it("should return when there is no adjectives.", () => {
        expect(getAdjectives("account_contact", "contact", "account")).toEqual([undefined, undefined]);
        expect(getAdjectives("accounts_contacts", "contact", "account")).toEqual([undefined, undefined]);
      });
    });
  });
  describe("(camel case)", () => {
    describe("(source first)", () => {
      it("should extract source.", () => {
        expect(getAdjectives("PrimaryContactAccount", "Contact", "Account")).toEqual(["Primary", undefined]);
        expect(getAdjectives("PrimaryContactsAccounts", "Contact", "Account")).toEqual(["Primary", undefined]);
      });

      it("should extract source without target table.", () => {
        expect(getAdjectives("PrimaryContact", "Contact", "Account")).toEqual(["Primary", undefined]);
        expect(getAdjectives("PrimaryContacts", "Contact", "Account")).toEqual(["Primary", undefined]);
      });

      it("should extract target.", () => {
        expect(getAdjectives("ContactSuperAccount", "Contact", "Account")).toEqual([undefined, "Super"]);
        expect(getAdjectives("ContactsSuperAccounts", "Contact", "Account")).toEqual([undefined, "Super"]);
      });

      it("should extract target without source table.", () => {
        expect(getAdjectives("SuperAccount", "Contact", "Account")).toEqual([undefined, "Super"]);
        expect(getAdjectives("SuperAccounts", "Contact", "Account")).toEqual([undefined, "Super"]);
      });

      it("should extract source and target.", () => {
        expect(getAdjectives("PrimaryContactSuperAccount", "Contact", "Account")).toEqual(["Primary", "Super"]);
        expect(getAdjectives("PrimaryContactsSuperAccounts", "Contact", "Account")).toEqual(["Primary", "Super"]);
      });

      it("should return when there is no adjectives.", () => {
        expect(getAdjectives("AccountContact", "contact", "account")).toEqual([undefined, undefined]);
        expect(getAdjectives("AccountsContacts", "contact", "account")).toEqual([undefined, undefined]);
      });
    });
    describe("(target first)", () => {
      it("should extract source.", () => {
        expect(getAdjectives("AccountPrimaryContact", "Contact", "Account")).toEqual(["Primary", undefined]);
        expect(getAdjectives("AccountsPrimaryContacts", "Contact", "Account")).toEqual(["Primary", undefined]);
      });

      it("should extract target.", () => {
        expect(getAdjectives("SuperAccountContact", "Contact", "Account")).toEqual([undefined, "Super"]);
        expect(getAdjectives("SuperAccountsContacts", "Contact", "Account")).toEqual([undefined, "Super"]);
      });

      it("should extract source and target.", () => {
        expect(getAdjectives("SuperAccountPrimaryContact", "Contact", "Account")).toEqual(["Primary", "Super"]);
        expect(getAdjectives("SuperAccountsPrimaryContacts", "Contact", "Account")).toEqual(["Primary", "Super"]);
      });

      it("should return when there is no adjectives.", () => {
        expect(getAdjectives("ContactAccount", "contact", "account")).toEqual([undefined, undefined]);
        expect(getAdjectives("ContactsAccounts", "contact", "account")).toEqual([undefined, undefined]);
      });
    });
  });
});
