Cypress.Commands.add('openSettings', () => {
    cy.get('#settings-button').click().get('#TransactionsSettingsComponent').as('settings').should('be.visible');
});

Cypress.Commands.add('closeSettings', () => {
    cy.get('@settings').get('#close-button').click();
});
