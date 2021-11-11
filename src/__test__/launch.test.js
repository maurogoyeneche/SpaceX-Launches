import { MemoryRouter } from "react-router-dom";
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import handlersWithData from './mocks/handlersWithData';

import App from '../App';

describe.only('Launch', () => {
    beforeEach(() => {
        render(
            <MemoryRouter initialEntries={['/launch/109']}>
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

    it('there should be a link to the Launches List page as way to go back.', async () => {
        const anchor = screen.getByRole('link', { name: /SpaceX Launches/i });
        expect(anchor).toHaveAttribute('href', '/');
    });

    describe('loading launch detail page', () => {
        it('there should be a progress bar when loading waiting for results', async () => {
            const progressbar = await screen.findByRole("progressbar");
            expect(progressbar).toBeInTheDocument();
        });

        describe('without results (not found)', () => {
            beforeEach(() => {
                render(
                    <MemoryRouter initialEntries={['/launch/234234']}>
                        <App />
                    </MemoryRouter>
                );
            });

            it('there should be a message `This launch does not exist`', async () => {
                const definitionLabel = await screen.findByText(/This launch does not exist/i);
                expect(definitionLabel).toBeInTheDocument();
            });
        });

        describe('with results', () => {
            it('there should be a title with the following format `${mission name} at ${launch site}`', async () => {
                const header = await screen.findByRole("heading", { name: /Sentinel-6 Michael Freilich at VAFB SLC 4E/i });
                expect(header).toBeInTheDocument();
            });

            it('there should be a description list with launch date with the format MM-DD-YYYY HH:mm', async () => {
                const definitionLabel = await screen.findByText(/lunch date:/i);
                expect(definitionLabel).toBeInTheDocument();
                const definitionDate = screen.getByText(/10\-24\-2020/i);
                expect(definitionDate).toBeInTheDocument();
            });

            it('there should be a description list with rocket name', async () => {
                const definitionLabel = await screen.findByText(/rocket name:/i);
                expect(definitionLabel).toBeInTheDocument();
                const definitionDate = screen.getByText('Falcon 9');
                expect(definitionDate).toBeInTheDocument();
            });

            it('there should be a picture of the launch if there is at last one with alt text as rocket name', async () => {
                const image = await screen.findByRole('img', { name: /Falcon 9/i });
                expect(image).toHaveAttribute('src', 'https://live.staticflickr.com/65535/50630802488_8cc373728e_o.jpg');
                expect(image).toBeInTheDocument();
            });

            it('there should be a paragraph with a description about the launch', async () => {
                const paragraph = await screen.findByText(/SpaceX will launch Sentinel-6 Michael Freilich into low Earth orbit for NASA, NOAA/i);
                expect(paragraph).toBeInTheDocument();
            });

            it('there should be a `see more...` link to a external article that opens in a new tab about the launch if there is a link.', async () => {
                const anchor = await screen.findByRole('link', { name: /see more.../i });
                expect(anchor).toHaveAttribute('href', 'https://spaceflightnow.com/2020/11/21/international-satellite-launches-to-extend-measurements-of-sea-level-rise/');
                expect(anchor).toHaveAttribute('target', '_blank');
            });
        });
    });
});
