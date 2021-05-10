"use strict";

angular.module('shared')

    .service('SiteHelper', [
        function SiteHelperService() {
            var self = this;

            self.RT_SITE_ID = 1;
            self.RK_SITE_ID = 2;
            self.VAZ_SITE_ID = 3;
            self.WAZ_SITE_ID = 4;
            self.RAZ_SITE_ID = 5;
            self.G6_SITE_ID = 6;
            self.G3_SITE_ID = 7;
            self.SAZ_SITE_ID = 8;
            self.INTERNAL_SITE_ID = 9;
            self.LP_SITE_ID = 10;
            self.LAZ_SITE_ID = 11;
            self.KURZ_SITE_ID = 12;
            self.INT_SITE_ID = 13;
            self.EL_SITE_ID = 14;
            self.AEX_SITE_ID = 15;
            self.STAGES_SITE_ID = 16;
            self.TRAINING_SITE_ID = 17;
            self.K3FF_SITE_ID = 18;
            self.RAZ_ELL_SITE_ID = 19;
            self.HSER_SITE_ID = 20;
            self.HSRC_SITE_ID = 21;
            self.TR_SITE_ID = 22;
            self.HEADSPROUT_SITE_ID = 23;
            self.KAZ_SITE_ID = 25;
            self.RAZ_PLUS_SITE_ID = 26;
            self.NONSUBSCRIPTION_SITE_ID = 27;

            self.RT_SITE_ABBREVIATION = 'rt';
            self.RK_SITE_ABBREVIATION = 'rk';
            self.VAZ_SITE_ABBREVIATION = 'vocab';
            self.WAZ_SITE_ABBREVIATION = 'waz';
            self.RAZ_SITE_ABBREVIATION = 'raz';
            self.G6_SITE_ABBREVIATION = 'G6';
            self.G3_SITE_ABBREVIATION = 'G3';
            self.SAZ_SITE_ABBREVIATION = 'saz';
            self.INTERNAL_SITE_ABBREVIATION = 'INTERNAL';
            self.LP_SITE_ABBREVIATION = 'LP';
            self.LAZ_SITE_ABBREVIATION = 'LAZ';
            self.KURZ_SITE_ABBREVIATION = 'kurz';
            self.INT_SITE_ABBREVIATION = 'int';
            self.EL_SITE_ABBREVIATION = 'el';
            self.AEX_SITE_ABBREVIATION = 'aex';
            self.STAGES_SITE_ABBREVIATION = 'stages';
            self.TRAINING_SITE_ABBREVIATION = 'LAZ-TRAIN';
            self.K3FF_SITE_ABBREVIATION = 'K3FF';
            self.RAZ_ELL_SITE_ABBREVIATION = 'raz-ell';
            self.HSER_SITE_ABBREVIATION = 'HSER';
            self.HSRC_SITE_ABBREVIATION = 'HSRC';
            self.TR_SITE_ABBREVIATION = 'tr';
            self.HEADSPROUT_SITE_ABBREVIATION = 'headsprout';
            self.KAZ_SITE_ABBREVIATION = 'kaz';
            self.RAZ_PLUS_SITE_ABBREVIATION = 'razplus';
            self.NONSUBSCRIPTION_SITE_ABBREVIATION = 'non-subscription';
        }]);
