﻿using System.ComponentModel.DataAnnotations;

namespace Project_SWP391.Model
{
    public class KoiFarm
    {
        [Key]
        public int FarmId { get; set; }
        public string FarmName { get; set; } = string.Empty;
        public string Introduction { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime OpenHour { get; set; } = DateTime.Now;
        public DateTime CloseHour { get; set; }
        public string Email { get; set; } = string.Empty;
        public float Rating { get; set; }
        public string Hotline { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<Koi> Kois { get; set; }
        public ICollection<FarmImage> FarmImages { get; set; }
    }
}
