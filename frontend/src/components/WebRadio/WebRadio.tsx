import React, { useState } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Clock } from 'lucide-react';
import { RADIO_INFO } from '../../data/mockData';
import styles from './WebRadio.module.scss';

export const WebRadio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section className={styles.radioSection}>
      <div className="section-container">
        <div className={styles.radioContainer}>
          {/* Coluna Esquerda: Player de Áudio */}
          <div className={styles.playerCol}>
            <div>
              <div className={styles.stationHeader}>
                <div className={styles.stationIcon}>
                  <Radio size={22} />
                </div>
                <h3 className={styles.stationName}>{RADIO_INFO.stationName}</h3>
              </div>
              <p className={styles.slogan}>{RADIO_INFO.slogan}</p>
            </div>

            {/* Caixa do Player */}
            <div className={styles.playerBox}>
              <div className={styles.trackInfo}>
                <div className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  <span>AO VIVO</span>
                </div>
                <div className={styles.trackTitle}>{RADIO_INFO.currentTrack}</div>
              </div>

              {/* Ondas do Equalizador */}
              <div
                className={`${styles.equalizer} ${isPlaying ? styles['equalizer--playing'] : ''}`}
                aria-hidden="true"
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={styles.bar} />
                ))}
              </div>

              {/* Controles de Play/Pause e Volume */}
              <div className={styles.controlsRow}>
                <button
                  type="button"
                  className={styles.playBtn}
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pausar Web Rádio' : 'Ouvir Web Rádio ao vivo'}
                >
                  {isPlaying ? <Pause size={22} fill="#061E46" /> : <Play size={22} fill="#061E46" />}
                </button>

                <div className={styles.volumeControl}>
                  <button
                    type="button"
                    className={styles.muteBtn}
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Desmutar' : 'Mutar'}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className={styles.volumeSlider}
                    aria-label="Controle de volume da rádio"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Programação */}
          <div className={styles.scheduleCol}>
            <h4 className={styles.scheduleTitle}>
              <Clock size={18} />
              <span>Programação em Destaque</span>
            </h4>
            <ul className={styles.programList}>
              {RADIO_INFO.programs.map((prog, index) => (
                <li key={index} className={styles.programItem}>
                  <span className={styles.timeBadge}>{prog.time}</span>
                  <div className={styles.progName}>{prog.title}</div>
                  <p className={styles.progDesc}>{prog.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
