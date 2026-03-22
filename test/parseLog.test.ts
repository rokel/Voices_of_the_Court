import path from 'path';
import { parseLog } from '../src/shared/gameData/parseLog';

const SAMPLE_LOG = path.join(__dirname, 'sample_log.txt');

// IDs from the sample log
const EOFORHILD_ID = 44225;
const RONWALD_ID   = 39033;
const CEOLWEARD_ID = 44220;
const SÆGYTH_ID    = 44221;
const HEARDR_ID    = 44224; // Heardræd
const ÆSCMANN_ID   = 46697;

describe('parseLog – relatives parsing', () => {
    let gameData: Awaited<ReturnType<typeof parseLog>>;

    beforeAll(async () => {
        gameData = await parseLog(SAMPLE_LOG);
    });

    it('returns a defined GameData object', () => {
        expect(gameData).toBeDefined();
    });

    it('loads both characters', () => {
        expect(gameData!.characters.has(EOFORHILD_ID)).toBe(true);
        expect(gameData!.characters.has(RONWALD_ID)).toBe(true);
    });

    describe('Eoforhild (AI) relatives', () => {
        it('has two parents', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const parents = eoforhild.relatives.filter(r => r.relationship === 'Parent');
            expect(parents).toHaveLength(2);
        });

        it('parent Ceolweard has correct birth date', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const ceolweard = eoforhild.relatives.find(r => r.id === CEOLWEARD_ID);
            expect(ceolweard).toBeDefined();
            expect(ceolweard!.relationship).toBe('Parent');
            expect(ceolweard!.birthDate).toBe('12 January, 821');
        });

        it('parent Sægyth has correct birth date', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const sægyth = eoforhild.relatives.find(r => r.id === SÆGYTH_ID);
            expect(sægyth).toBeDefined();
            expect(sægyth!.birthDate).toBe('5 January, 827');
        });

        it('has three siblings', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const siblings = eoforhild.relatives.filter(r => r.relationship === 'Sibling');
            expect(siblings).toHaveLength(3);
        });

        it('sibling Heardræd has correct birth date, gender, and is unmarried', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const heardr = eoforhild.relatives.find(r => r.id === HEARDR_ID);
            expect(heardr).toBeDefined();
            expect(heardr!.relationship).toBe('Sibling');
            expect(heardr!.sheHe).toBe('he');
            expect(heardr!.birthDate).toBe('4 January, 843');
            expect(heardr!.maritalStatus).toBe('unmarried');
            expect(heardr!.isDeceased).toBe(false);
        });

        it('sibling Heardræd has expected traits', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const heardr = eoforhild.relatives.find(r => r.id === HEARDR_ID)!;
            const traitNames = heardr.traits.map(t => t.name);
            expect(traitNames).toContain('Vengeful');
            expect(traitNames).toContain('Diligent');
            expect(traitNames).toContain('Fortune Builder');
            expect(heardr.traits).toHaveLength(9);
        });

        it('sibling Ronwald (the player) is recorded with correct birth date and unmarried', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const ronwald = eoforhild.relatives.find(r => r.id === RONWALD_ID);
            expect(ronwald).toBeDefined();
            expect(ronwald!.relationship).toBe('Sibling');
            expect(ronwald!.birthDate).toBe('1 January, 849');
            expect(ronwald!.maritalStatus).toBe('unmarried');
        });

        it('sibling Æscmann has Modest trait and is unmarried', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const æscmann = eoforhild.relatives.find(r => r.id === ÆSCMANN_ID);
            expect(æscmann).toBeDefined();
            expect(æscmann!.maritalStatus).toBe('unmarried');
            expect(æscmann!.traits.map(t => t.name)).toContain('Modest');
        });
    });

    describe('Ronwald (player) relatives', () => {
        it('has two parents with correct birth dates', () => {
            const ronwald = gameData!.characters.get(RONWALD_ID)!;
            const parents = ronwald.relatives.filter(r => r.relationship === 'Parent');
            expect(parents).toHaveLength(2);
            expect(parents.find(p => p.id === CEOLWEARD_ID)!.birthDate).toBe('12 January, 821');
            expect(parents.find(p => p.id === SÆGYTH_ID)!.birthDate).toBe('5 January, 827');
        });

        it('has three siblings including Eoforhild', () => {
            const ronwald = gameData!.characters.get(RONWALD_ID)!;
            const siblings = ronwald.relatives.filter(r => r.relationship === 'Sibling');
            expect(siblings).toHaveLength(3);
            expect(siblings.find(s => s.id === EOFORHILD_ID)).toBeDefined();
        });

        it('sibling Eoforhild has correct gender and traits', () => {
            const ronwald = gameData!.characters.get(RONWALD_ID)!;
            const eoforhild = ronwald.relatives.find(r => r.id === EOFORHILD_ID)!;
            expect(eoforhild.sheHe).toBe('she');
            const traitNames = eoforhild.traits.map(t => t.name);
            expect(traitNames).toContain('Ambitious');
            expect(traitNames).toContain('Mastermind Philosopher');
            expect(traitNames).toContain('Delicate');
        });
    });

    describe('birthTotalDays propagation', () => {
        it('populates Eoforhild.birthTotalDays from Ronwald sibling log', () => {
            // Eoforhild appears as Ronwald's sibling with birthTotalDays 308443
            expect(gameData!.characters.get(EOFORHILD_ID)!.birthTotalDays).toBe(308443);
        });

        it('populates Ronwald.birthTotalDays from Eoforhild sibling log', () => {
            // Ronwald appears as Eoforhild's sibling with birthTotalDays 309886
            expect(gameData!.characters.get(RONWALD_ID)!.birthTotalDays).toBe(309886);
        });

        it('stores birthTotalDays on the Relative entry', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const heardr = eoforhild.relatives.find(r => r.id === HEARDR_ID)!;
            expect(heardr.birthTotalDays).toBe(307699);
        });
    });

    describe('getRelativesDescription()', () => {
        // game totalDays from the sample log init line
        const GAME_TOTAL_DAYS = 316907;

        it('returns a non-empty string for Eoforhild', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const desc = eoforhild.getRelativesDescription(GAME_TOTAL_DAYS);
            expect(desc).toBeTruthy();
            expect(desc).toContain('Parents');
            expect(desc).toContain('Siblings');
        });

        it('includes sibling names in the description', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const desc = eoforhild.getRelativesDescription(GAME_TOTAL_DAYS);
            expect(desc).toContain('Heardræd');
            expect(desc).toContain('Æscmann');
        });

        it('labels Heardræd as older brother and Ronwald as younger brother', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const desc = eoforhild.getRelativesDescription(GAME_TOTAL_DAYS);
            // Heardræd born 4 Jan 843 (307699), Eoforhild born 18 Jan 845 (308443) → older
            expect(desc).toContain('older brother Heardræd');
            // Ronwald born 1 Jan 849 (309886) → younger
            expect(desc).toContain('younger brother');
        });

        it('includes calculated ages for living relatives', () => {
            const eoforhild = gameData!.characters.get(EOFORHILD_ID)!;
            const desc = eoforhild.getRelativesDescription(GAME_TOTAL_DAYS);
            // Heardræd: floor((316907-307699)/365.25) = 25
            expect(desc).toContain('age 25');
            // Ronwald: floor((316907-309886)/365.25) = 19
            expect(desc).toContain('age 19');
        });
    });
});
