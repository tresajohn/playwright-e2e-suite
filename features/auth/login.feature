@bdd @no-auth
Feature: User Authentication

  Background:
    Given I am on the OrangeHRM login page

  @smoke
  Scenario: Successful login with valid admin credentials
    When I enter valid admin credentials
    And I click the login button
    Then I should be redirected to the dashboard

  @regression
  Scenario Outline: Failed login with invalid credentials shows error
    When I enter username "<username>" and password "<password>"
    And I click the login button
    Then I should see an invalid credentials error

    Examples:
      | username    | password      |
      | invalidUser | wrongPass123  |
      | Admin       | wrongPassword |

  @regression
  Scenario: Password field should mask input
    When I type "secretpassword" into the password field
    Then the password field type should be "password"

  @smoke
  Scenario: Successful logout redirects to login page
    When I enter valid admin credentials
    And I click the login button
    And I click logout from the user menu
    Then I should be redirected to the login page

  @regression
  Scenario: Empty form submission shows required field errors
    When I click the login button
    Then I should see required field validation errors
