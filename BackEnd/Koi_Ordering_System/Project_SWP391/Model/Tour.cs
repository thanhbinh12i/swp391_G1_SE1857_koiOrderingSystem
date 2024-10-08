﻿using System.ComponentModel.DataAnnotations;

namespace Project_SWP391.Model
{
    public class Tour
    {
        [Key]
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public float Price { get; set; }
        public DateTime  StartTime { get; set; } = DateTime.Now;
        public DateTime FinishTime { get; set; }

        // Navigation properties
        public ICollection<Bill> Bills { get; set; }
    }
}
