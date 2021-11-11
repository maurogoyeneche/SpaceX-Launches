import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import handlersWithData from './mocks/handlersWithData';
import handlersWithoutData from './mocks/handlersWithoutData';
import handlersWithError from './mocks/handlersWithError';

import App from '../App';


describe('Launches', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
    });
    const server = setupServer(...handlersWithData);
    // Establish API mocking before all tests.
    beforeAll(() => server.listen());
    // Reset any request handlers that we may add during the tests,
    // so they don't affect other tests.
    afterEach(() => server.resetHandlers());
    // Clean up after the tests are finished.
    afterAll(() => server.close());

    describe('initial state before start a search', () => {
        it('there should be a title', () => {
            expect(
                screen.getByRole("heading", { name: /SpaceX Launches/i })
            ).toBeInTheDocument();
        })

        it('there should be an input text with label "filter by mission name"', () => {
            expect(
                screen.getByLabelText(/mission name/i)
            ).toBeInTheDocument();
        });

        it('there should be a search button', () => {
            const searchBtn = screen.getByRole('button', { name: /search/i });
            expect(searchBtn).toBeInTheDocument();
        });

        it('there should be a initial message', () => {
            const defaultMsg = screen.getByRole('heading', { name: /please provide a search option and click in the search button/i });
            expect(defaultMsg).toBeInTheDocument();
        });
    });

    describe('after starting a search without using filter by mission name', () => {
        describe('with results', () => {
            it('search button should be disabled until the search is done.', async () => {
                const searchBtn = screen.getByRole('button', { name: /search/i });
                expect(searchBtn).not.toBeDisabled();
                fireEvent.click(searchBtn);
                await waitFor(() =>
                    expect(searchBtn).toBeDisabled()
                );
                await waitFor(() =>
                    expect(searchBtn).not.toBeDisabled()
                );
            });
    
            it('the data should be displayed in a table.', async () => {
                const searchBtn = screen.getByRole('button', { name: /search/i });
                let defaultMsg = screen.queryByText(/please provide a search option and click in the search button/i);
    
                expect(defaultMsg).toBeInTheDocument();
                expect(screen.queryByRole('table')).toBe(null);
    
                fireEvent.click(searchBtn);
    
                defaultMsg = await screen.findByText(/please provide a search option and click in the search button/i);
                expect(defaultMsg).not.toBeInTheDocument();
    
                const table = await screen.findByRole('table');
                expect(table).toBeInTheDocument();
            });
    
            it('the header table should be: mision, rocket, launch site and launch date', async () => {
                const searchBtn = screen.getByRole('button', { name: /search/i });
    
                let tableDOM = screen.queryByRole('table');
                expect(tableDOM).not.toBeInTheDocument();
    
                fireEvent.click(searchBtn);
    
                tableDOM = await screen.findByRole('table');
                const table = within(tableDOM);
    
                const tableCells = table.getAllByRole('columnheader');
                expect(tableCells).toHaveLength(4);
    
                const mission = table.getByRole('columnheader', { name: /mission/i });
                const rocket = table.getByRole('columnheader', { name: /rocket/i });
                const launchSite = table.getByRole('columnheader', { name: /launch site/i });
                const launchDate = table.getByRole('columnheader', { name: /launch date/i });
    
                expect(mission).toBeInTheDocument();
                expect(rocket).toBeInTheDocument();
                expect(launchSite).toBeInTheDocument();
                expect(launchDate).toBeInTheDocument();
            });
    
            it(`each result row should have: launch image, mission name, rocket name, launch site and launch date. it should have a link that opens Launch Detail page.`, async () => {
                const searchBtn = screen.getByRole('button', { name: /search/i });
                let tableDOM = screen.queryByRole('table');
                expect(tableDOM).not.toBeInTheDocument();
    
                fireEvent.click(searchBtn);
    
                tableDOM = await screen.findByRole('table');
                const table = within(tableDOM);
    
                const tableCells = table.getAllByRole('cell');
                const [mission, rocket, launchSite, launchDate] = tableCells;
    
                expect(mission).toHaveTextContent(/Sentinel-6 Michael Freilich/i);
                expect(rocket).toHaveTextContent(/Falcon 9/i);
                expect(launchSite).toHaveTextContent(/VAFB SLC 4E/i);
                expect(launchDate).toHaveTextContent(/2020-10-24/i);
    
                const withinRepo = within(mission);
    
                const avatarImage = withinRepo.getByRole('img', { name: /Sentinel-6 Michael Freilich/i });
                expect(avatarImage).toBeInTheDocument();
                const anchor = withinRepo.getByRole('link', { name: /Sentinel-6 Michael Freilich/i });
                expect(anchor).toHaveAttribute('href', '/launch/109');
                expect(avatarImage).toHaveAttribute('src', 'https://live.staticflickr.com/65535/50630802488_8cc373728e_o.jpg');
            });
    
            it('should show total number of launches and the current number of results on table', async () => {
                let paginatorText = screen.queryByText(/1\-30 of 109/i);
                expect(paginatorText).not.toBeInTheDocument();
    
                const searchBtn = screen.getByRole('button', { name: /search/i });
                fireEvent.click(searchBtn);
    
                paginatorText = await screen.findByText(/1\-30 of 109/i);
    
                expect(paginatorText).toBeInTheDocument();
            });
    
            it('the data should be paginated with items per page options: 30, 50, 100. The default is 30', async () => {
                const searchBtn = screen.getByRole('button', { name: /search/i });
                fireEvent.click(searchBtn);
    
                const paginatorBtn = await screen.findByLabelText(/rows per page/i);
    
                expect(paginatorBtn).toHaveTextContent('30');
    
                userEvent.click(paginatorBtn);
    
                const rowsOptions = screen.getAllByRole('option');
    
                expect(rowsOptions).toHaveLength(3);
                const [thirty, fifty, hundred] = rowsOptions;
    
                expect(thirty).toHaveTextContent('30');
                expect(fifty).toHaveTextContent('50');
                expect(hundred).toHaveTextContent('100');
            });
    
            it(`should exist pagination next and previous button,
                and previous button should start disable`, async () => {
                const searchBtn = screen.getByRole('button', { name: /search/i });
                fireEvent.click(searchBtn);
    
                const previousBtn = await screen.findByRole('button', { name: /previous/i });
                const nextBtn = await screen.findByRole('button', { name: /next/i });
    
                expect(previousBtn).toBeInTheDocument();
                expect(previousBtn).toBeDisabled();
                expect(nextBtn).toBeInTheDocument();
            });
    
            it(`if the pagination option is 30:
                 - it should show next 30 launches when clicking next button 
                 - it should show previous lunches back again when clicking previous button`,
                async () => {
                    const searchBtn = screen.getByRole('button', { name: /search/i });
                    fireEvent.click(searchBtn);
    
                    await screen.findByRole('progressbar');
    
                    const [, firstRow] = await screen.findAllByRole('row');
                    expect(firstRow).toHaveTextContent(/Sentinel-6 Michael Freilich/i);
    
                    const nextBtn = await screen.findByRole('button', { name: /next/i });
                    userEvent.click(nextBtn);
    
                    await screen.findByRole('progressbar');
    
                    const [, firstRowSecondPage] = await screen.findAllByRole('row');
                    expect(firstRowSecondPage).toHaveTextContent(/Starlink v0.9/i);
    
                    const previousBtn = await screen.findByRole('button', { name: /previous/i });
                    userEvent.click(previousBtn);
    
                    await screen.findByRole('progressbar');
    
                    const [, firstRowFirstPage] = await screen.findAllByRole('row');
                    expect(firstRowFirstPage).toHaveTextContent(/Sentinel-6 Michael Freilich/i);
                });
    
            it(`if the pagination option is 30:
                - it should show next 30 launches when clicking next button 
                - it should show disable the next button when there is not more pages`,
                async () => {
                    const searchBtn = screen.getByRole('button', { name: /search/i });
                    fireEvent.click(searchBtn);
    
                    await screen.findByRole('progressbar');
    
                    const firstPage = await screen.findAllByRole('row');
                    // the header count as a row
                    expect(firstPage.length).toBe(31);
    
                    const nextBtn = await screen.findByRole('button', { name: /next/i });
                    expect(nextBtn).not.toBeDisabled();
    
                    userEvent.click(nextBtn);
                    await screen.findByRole('progressbar');
    
                    const secondPage = await screen.findAllByRole('row');
                    expect(secondPage.length).toBe(31);
    
                    const secondPageNextBtn = screen.getByRole('button', { name: /next/i });
                    expect(secondPageNextBtn).not.toBeDisabled();
                    userEvent.click(secondPageNextBtn);
                    await screen.findByRole('progressbar');
    
                    const thirdPage = await screen.findAllByRole('row');
                    expect(thirdPage.length).toBe(31);
    
                    const thirdPageNextBtn = screen.getByRole('button', { name: /next/i });
                    expect(thirdPageNextBtn).not.toBeDisabled();
                    userEvent.click(thirdPageNextBtn);
                    await screen.findByRole('progressbar');
    
                    const fourthPage = await screen.findAllByRole('row');
                    expect(fourthPage.length).toBe(20);
                    
                    const fourthPageNextBtn = screen.getByRole('button', { name: /next/i });
                    expect(fourthPageNextBtn).toBeDisabled();
                });

                it(`if the pagination option is 30:
                    - the table should show 50 launches when the 50 option is selected
                    - it should show next 50 launches when clicking next button
                    - it should show the first 50 lunches again when clicking search button`, async () => {
                    const searchBtn = screen.getByRole('button', { name: /search/i });
                    fireEvent.click(searchBtn);
        
                    const paginatorBtn = await screen.findByLabelText(/rows per page/i);
        
                    expect(paginatorBtn).toHaveTextContent('30');
        
                    userEvent.click(paginatorBtn);
        
                    const rowsOptions = screen.getAllByRole('option');
        
                    expect(rowsOptions).toHaveLength(3);
                    const [, fifty] = rowsOptions;
        
                    userEvent.click(fifty);

                    await screen.findByRole('progressbar');

                    const rows = await screen.findAllByRole('row');
                    // rows includes header
                    expect(rows.length).toBe(51);
                    const [, firstRow] = rows;
                    expect(firstRow).toHaveTextContent(/Sentinel-6 Michael Freilich/i);

                    const nextBtn = await screen.findByRole('button', { name: /next/i });
                    userEvent.click(nextBtn);
    
                    await screen.findByRole('progressbar');
    
                    const secondPageRows = await screen.findAllByRole('row');
                    expect(secondPageRows.length).toBe(51);
                    const [, firstRowSecondPage] = secondPageRows;
                    expect(firstRowSecondPage).toHaveTextContent(/CRS-14/i);
    
                    // press search button from second page
                    userEvent.click(searchBtn);
    
                    await screen.findByRole('progressbar');
    
                    const firstPageRows = await screen.findAllByRole('row');
                    const [, firstRowFirstPage] = firstPageRows;
                    expect(firstPageRows.length).toBe(51);
                    expect(firstRowFirstPage).toHaveTextContent(/Sentinel-6 Michael Freilich/i);
                });
        });
    
        describe('no results', () => {
            beforeEach(() => {
                server.use(...handlersWithoutData);
            });
    
            it('there should be a message "You search has no results"', async () => {
                let noDataMessage = screen.queryByRole('heading', { name: /you search has no results/i });
                expect(noDataMessage).not.toBeInTheDocument();
    
                const searchBtn = screen.getByRole('button', { name: /search/i });
                fireEvent.click(searchBtn);
    
                noDataMessage = await screen.findByRole('heading', { name: /you search has no results/i });
                expect(noDataMessage).toBeInTheDocument();
    
                const table = screen.queryByRole('table');
                expect(table).not.toBeInTheDocument();
            });
        });

        describe('with errors', () => {
            beforeEach(() => {
                server.use(...handlersWithError);
            });
    
            it('there should be a message with the error that comes from backend', async () => {
                const noDataMessage = screen.queryByRole('heading', { name: /you search has no results/i });
                expect(noDataMessage).not.toBeInTheDocument();
    
                const searchBtn = screen.getByRole('button', { name: /search/i });
                fireEvent.click(searchBtn);

                await screen.findByRole('progressbar');
    
                const errorData = await screen.findByRole('heading', { name: /Things went wrong doing blah blah blah/i });
                expect(errorData).toBeInTheDocument();
    
                const table = screen.queryByRole('table');
                expect(table).not.toBeInTheDocument();
            });
        });
    });

    describe('after starting a search using filter by mission name', () => {
        it('should list only mission name that matches the entered filter', async () => {
            const inputFilter = screen.getByRole('textbox', { name: /mission Name/i });
            userEvent.type(inputFilter, 'starlink');

            const searchBtn = screen.getByRole('button', { name: /search/i });
            userEvent.click(searchBtn);
            
            await screen.findByRole('progressbar');

            const thirdPage = await screen.findAllByRole('row');
            const [, ...filteredRows ] = thirdPage;
            expect(filteredRows).not.toBe(30);
            filteredRows.forEach((row) => {
                expect(row).toHaveTextContent(/StarLink/i);
            });
        });
    });
});
