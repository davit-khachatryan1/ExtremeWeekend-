/* Drop-in recordings.
 * Any audio file put in  src/assets/sounds/  is picked up automatically — no code
 * or config changes. Missing files simply keep the built-in (generated) sound.
 * Files are only downloaded after a visitor turns sound on.
 *
 *   uaz-idle.mp3        UAZ idling (loop)                → replaces the generated engine
 *   uaz-drive.mp3       UAZ driving at steady speed (loop)
 *   uaz-start.mp3       engine start, plays once (optional)
 *   gravel.mp3          tyres on gravel (loop, optional)
 *   birds/*.mp3         clear single bird songs, any names (one-shots)
 *   birds-ambience.mp3  soft forest background (loop)
 *   owl.mp3             owl call for the camp at night (optional)
 *
 * See README → "Natural sounds" for what each recording should contain. */

const files = import.meta.glob('../assets/sounds/**/*.{mp3,m4a,aac,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const named: Record<string, string> = {};
const birdSongs: string[] = [];
for (const [path, url] of Object.entries(files)) {
  const rel = path.replace(/^.*\/assets\/sounds\//, '').toLowerCase();
  if (rel.startsWith('birds/')) birdSongs.push(url);
  else named[rel.replace(/\.[a-z0-9]+$/, '')] = url;
}

export const SOUND_FILES = {
  uazIdle: named['uaz-idle'] as string | undefined,
  uazDrive: named['uaz-drive'] as string | undefined,
  uazStart: named['uaz-start'] as string | undefined,
  gravel: named['gravel'] as string | undefined,
  birdsAmbience: named['birds-ambience'] as string | undefined,
  owl: named['owl'] as string | undefined,
  birdSongs: birdSongs.sort(),
};
