/// <reference types="cypress" />


context('Transactions Page', () => {

    describe('toolbar', () => {
        beforeEach(() => cy.visit('/'));

        it('should display with a title and functional settings button', () => {
            cy.get('mat-toolbar').should('be.visible').contains('Transactions')
                .get('#settings-button').should('be.visible').click();

            // Should open after clicking settings button.
            cy.get('#TransactionsSettingsComponent').should('be.visible');
        });

    });

    describe('list', () => {

        beforeEach(() => cy.visit('/'));

        it('should display', () => {
            cy.get('#list').should('be.visible');
        });


        // START - Default configuration tests
        // Comment these out if the default config is changed, ie the receiver and orderBy properties of initial state.
        it('should display refresh button (default config)', () => {
            cy.get('#refresh-button').should('be.visible');
        });

        it('should display only 10 transactions (default config)', () => {
            cy.get('.item').filter(':visible').should('have.length.at.least', 10);
        });

        it('should fetch more transactions on each scroll to bottom', () => {
            cy.get('#pseudo-item-bottom').scrollIntoView();
            // Scroll to bottom will trigger new fetch, wait for response and UI to update.
            // TODO: Simulate request and use an alias to wait for response.
            cy.wait(2000);

            cy.get('#pseudo-item-bottom').scrollIntoView();
            cy.wait(2000);
            cy.get('#pseudo-item-bottom').scrollIntoView();
            cy.wait(2000);

            // Open settings using custom command and enable displaying of list length; close using customCommand.
            cy.openSettings();
            cy.get('#list-length-field>mat-checkbox>.mat-checkbox-layout>.mat-checkbox-inner-container>.mat-checkbox-input').check({ force: true })
            cy.closeSettings();

            cy.get('#list-length-note').invoke('text').then(text => {
                expect(+text.match(/\d+/g).pop()).to.be.at.least(30);
            });
        });
        // END - Default configuration tests


        it('should display row ID column if setting is enabled', () => {
            cy.openSettings();
            cy.get('#row-id-field>mat-checkbox>.mat-checkbox-layout>.mat-checkbox-inner-container>.mat-checkbox-input').check({ force: true });
            cy.closeSettings();

            cy.get('#row-id-column-header').should('be.visible');
            cy.get('.row-id-column').last().should('be.visible');
        });
    });
});